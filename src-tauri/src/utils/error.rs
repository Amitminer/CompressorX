//! Error Handling Module
//! 
//! This module defines custom error types and result aliases used throughout the application.

use thiserror::Error;

/// Custom error type for video compression operations
/// 
/// This enum defines all possible error types that can occur during video compression
/// and processing operations.
#[derive(Error, Debug)]
pub enum CompressorError {
    /// Errors related to FFmpeg operations
    #[error("FFmpeg error: {0}")]
    FFmpegError(String),
    /// Errors related to file operations
    #[error("File error: {0}")]
    FileError(String),
    /// Errors related to invalid input parameters
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

/// Result type alias for compression operations
/// 
/// This type alias simplifies error handling by using the custom `CompressorError` type.
pub type Result<T> = std::result::Result<T, CompressorError>; 