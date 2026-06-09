#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Utf8(#[from] std::string::FromUtf8Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "name", content = "message")]
#[serde(rename_all = "camelCase")]
enum ErrorName {
    Io(String),
    FromUtf8Error(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let message = self.to_string();
        let name = match self {
            Self::Io(_) => ErrorName::Io(message),
            Self::Utf8(_) => ErrorName::FromUtf8Error(message),
        };
        name.serialize(serializer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn io_error_serializes_with_correct_shape() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let err = Error::Io(io_err);
        let json = serde_json::to_value(&err).unwrap();

        assert_eq!(json["name"], "io");
        assert!(json["message"].as_str().unwrap().contains("file not found"));
    }

    #[test]
    fn utf8_error_serializes_with_correct_shape() {
        let invalid = vec![0xFF, 0xFE];
        let utf8_err = String::from_utf8(invalid).unwrap_err();
        let err = Error::Utf8(utf8_err);
        let json = serde_json::to_value(&err).unwrap();

        assert_eq!(json["name"], "fromUtf8Error");
        assert!(json["message"].as_str().unwrap().contains("invalid utf-8"));
    }

    #[test]
    fn error_json_has_exactly_name_and_message_fields() {
        let io_err = std::io::Error::new(std::io::ErrorKind::Other, "test");
        let err = Error::Io(io_err);
        let json = serde_json::to_value(&err).unwrap();
        let obj = json.as_object().unwrap();

        assert_eq!(obj.len(), 2);
        assert!(obj.contains_key("name"));
        assert!(obj.contains_key("message"));
    }
}

