use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State};
use thiserror::Error;

// ============================================================================
// Types & State
// ============================================================================

#[derive(Debug, Clone)]
pub struct AppState {
    client: Arc<Client>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            client: Arc::new(
                Client::builder()
                    .pool_max_idle_per_host(10)
                    .build()
                    .expect("Failed to create HTTP client"),
            ),
        }
    }
}

#[derive(Error, Debug)]
pub enum CodeHelperError {
    #[error("Request failed: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("Failed to parse response: {0}")]
    ParseError(String),
    #[error("Ollama server not available")]
    OllamaUnavailable,
    #[error("File operation failed: {0}")]
    FileError(String),
}

impl Serialize for CodeHelperError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// ============================================================================
// Ollama API Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
struct OllamaGenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    context: Option<Vec<i64>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaGenerateResponse {
    #[serde(default)]
    response: String,
    #[serde(default)]
    done: bool,
    #[serde(default)]
    context: Vec<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

// ============================================================================
// System Prompt for Student-Friendly Responses
// ============================================================================

const STUDENT_SYSTEM_PROMPT: &str = r#"You are a friendly and helpful coding assistant designed for secondary school students (ages 11-18). Your role is to:

1. Explain coding concepts in clear, age-appropriate language
2. Provide well-commented code examples that students can learn from
3. Encourage students and maintain a positive, supportive tone
4. Break down complex problems into manageable steps
5. Use analogies and real-world examples to clarify abstract concepts
6. Be patient and never condescending
7. Adjust complexity based on the student's apparent skill level

When writing code:
- Include helpful comments explaining what each part does
- Use descriptive variable names
- Follow best practices and modern conventions
- Explain why you made specific design choices

Remember: Your goal is to help students learn, not just solve their problems for them. Guide them toward understanding."#;

// ============================================================================
// Tauri Commands
// ============================================================================

#[tauri::command]
async fn check_ollama(state: State<'_, AppState>) -> Result<bool, CodeHelperError> {
    let url = "http://localhost:11434/api/tags";

    match state.client.get(url).send().await {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn generate_code_stream(
    prompt: String,
    model: String,
    context: Option<Vec<Message>>,
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), CodeHelperError> {
    let url = "http://localhost:11434/api/generate";

    // Build the full prompt with conversation context
    let mut full_prompt = String::new();

    if let Some(messages) = context {
        for msg in messages {
            if msg.role == "user" {
                full_prompt.push_str(&format!("User: {}\n\n", msg.content));
            } else if msg.role == "assistant" {
                full_prompt.push_str(&format!("Assistant: {}\n\n", msg.content));
            }
        }
    }

    full_prompt.push_str(&format!("User: {}", prompt));

    let request_body = OllamaGenerateRequest {
        model,
        prompt: full_prompt,
        stream: true,
        system: Some(STUDENT_SYSTEM_PROMPT.to_string()),
        context: None,
    };

    // Make streaming request
    let response = state
        .client
        .post(url)
        .json(&request_body)
        .send()
        .await
        .map_err(|_| CodeHelperError::OllamaUnavailable)?;

    if !response.status().is_success() {
        let _ = app_handle.emit("gen_error", "Failed to connect to Ollama");
        return Err(CodeHelperError::OllamaUnavailable);
    }

    let mut stream = response.bytes_stream();

    // Process stream chunks
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let text = String::from_utf8_lossy(&bytes);

                // Parse each JSON line
                for line in text.lines() {
                    if line.trim().is_empty() {
                        continue;
                    }

                    match serde_json::from_str::<OllamaGenerateResponse>(line) {
                        Ok(json_response) => {
                            if json_response.done {
                                let _ = app_handle.emit("gen_done", ());
                            } else if !json_response.response.is_empty() {
                                let _ = app_handle.emit("gen_chunk", json_response.response);
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to parse JSON line: {} - Error: {}", line, e);
                        }
                    }
                }
            }
            Err(e) => {
                let error_msg = format!("Stream error: {}", e);
                let _ = app_handle.emit("gen_error", error_msg);
                return Err(CodeHelperError::RequestError(e));
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn save_code(code: String, filename: String) -> Result<(), CodeHelperError> {
    use tauri_plugin_dialog::{DialogExt, FilePath};

    // This will be handled by the frontend using Tauri's dialog plugin
    // Keeping this command for compatibility but actual implementation uses frontend
    Ok(())
}

// ============================================================================
// App Builder
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize app state
            app.manage(AppState::default());

            // Setup logging in debug mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Register dialog and opener plugins
            app.handle().plugin(tauri_plugin_dialog::init())?;
            app.handle().plugin(tauri_plugin_opener::init())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_ollama,
            generate_code_stream,
            save_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
