//! Compression Models
//! 
//! This module contains the data structures used for video compression settings and results.

use serde::{Deserialize, Serialize};

/// Settings for video compression
/// 
/// This struct defines the parameters used when compressing a video file.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CompressionSettings {
    /// Video bitrate in kilobits per second (kbps)
    pub bitrate: u32,
    /// Buffer size in kilobits per second (kbps)
    pub buffer_size: u32,
    /// Target resolution ("original", "720p", "480p", "360p")
    pub resolution: String,
}

/// Results of a video compression operation
/// 
/// This struct contains information about the compression process and its outcome.
#[derive(Debug, Serialize)]
pub struct CompressionResult {
    /// Whether the compression was successful
    pub success: bool,
    /// Path to the compressed output file
    pub output_path: String,
    /// Size of the original file in bytes
    pub original_size: u64,
    /// Size of the compressed file in bytes
    pub compressed_size: u64,
    /// Compression ratio as a percentage
    pub compression_ratio: f64,
    /// Error message if compression failed
    pub error_message: Option<String>,
} 