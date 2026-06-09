use super::errors::Error;
use std::fs;

#[tauri::command]
pub fn read(path: String) -> Result<String, Error> {
    let data = fs::read(path)?;
    let string = String::from_utf8(data)?;
    Ok(string)
}

#[tauri::command]
pub fn write(path: String, contents: String) -> Result<(), Error> {
    fs::write(path, contents)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;
    use std::io::Write;

    #[test]
    fn write_then_read_roundtrip() {
        let tmp = NamedTempFile::new().unwrap();
        let path = tmp.path().to_str().unwrap().to_string();

        write(path.clone(), "Hello, Tauri!".to_string()).unwrap();
        let result = read(path).unwrap();
        assert_eq!(result, "Hello, Tauri!");
    }

    #[test]
    fn write_overwrites_existing_content() {
        let tmp = NamedTempFile::new().unwrap();
        let path = tmp.path().to_str().unwrap().to_string();

        write(path.clone(), "first".to_string()).unwrap();
        write(path.clone(), "second".to_string()).unwrap();
        let result = read(path).unwrap();
        assert_eq!(result, "second");
    }

    #[test]
    fn write_empty_string() {
        let tmp = NamedTempFile::new().unwrap();
        let path = tmp.path().to_str().unwrap().to_string();

        write(path.clone(), String::new()).unwrap();
        let result = read(path).unwrap();
        assert_eq!(result, "");
    }

    #[test]
    fn write_unicode_content() {
        let tmp = NamedTempFile::new().unwrap();
        let path = tmp.path().to_str().unwrap().to_string();

        let unicode = "Olá, 世界! 🎉".to_string();
        write(path.clone(), unicode.clone()).unwrap();
        let result = read(path).unwrap();
        assert_eq!(result, unicode);
    }

    #[test]
    fn read_nonexistent_file_returns_io_error() {
        let result = read("/tmp/__nonexistent_test_file_42__".to_string());
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(matches!(err, Error::Io(_)));
    }

    #[test]
    fn read_invalid_utf8_returns_utf8_error() {
        let mut tmp = NamedTempFile::new().unwrap();
        // Write invalid UTF-8 bytes
        tmp.write_all(&[0xFF, 0xFE, 0x00, 0x80]).unwrap();
        tmp.flush().unwrap();
        let path = tmp.path().to_str().unwrap().to_string();

        let result = read(path);
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(matches!(err, Error::Utf8(_)));
    }
}
