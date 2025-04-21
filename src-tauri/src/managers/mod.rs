//! Managers Module
//! 
//! This module contains the core business logic managers that handle
//! video processing and compression operations.

pub mod video;

pub use video::{compress_video, get_video_info}; 