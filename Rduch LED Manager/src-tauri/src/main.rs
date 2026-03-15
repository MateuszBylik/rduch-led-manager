#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::process::Command;
use sysinfo::Disks;

#[derive(Serialize)]
struct Song {
    number: String,
    title: String,
    filename: String,
}

#[derive(Serialize)]
struct ValidationError {
    filename: String,
    message: String,
}

#[derive(Serialize)]
struct ParseResult {
    path: String,
    errors: Vec<ValidationError>,
    playlists: Vec<Song>,
    screens: Vec<Song>,
    categories: HashMap<String, Vec<Song>>,
}

#[derive(serde::Serialize)]
struct DriveInfo {
    name: String,
    mount_point: String,
    is_removable: bool,
}

#[tauri::command]
fn open_in_explorer(path: String) {
    #[cfg(target_os = "windows")]
    Command::new("explorer").arg(path).spawn().ok();

    #[cfg(target_os = "macos")]
    Command::new("open").arg(path).spawn().ok();

    #[cfg(target_os = "linux")]
    Command::new("xdg-open").arg(path).spawn().ok();
}

#[tauri::command]
fn get_drives() -> Vec<DriveInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut drives = Vec::new();
    
    for disk in disks.list() {
        if disk.is_removable() {
            drives.push(DriveInfo {
                name: disk.name().to_string_lossy().to_string(),
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                is_removable: true,
            });
        }
    }
    drives
}

#[tauri::command]
fn load_sd_card(path: String) -> Option<ParseResult> {
    let folder = std::path::PathBuf::from(&path);
    if !folder.exists() { return None; }
    let path_str = path.clone();
    
    let mut errors = Vec::new();
    let mut playlists = Vec::new();
    let mut screens = Vec::new();
    let mut categories: HashMap<String, Vec<Song>> = HashMap::new();
    
    let mut seen_playlist_nums: HashSet<String> = HashSet::new();
    let mut seen_screen_nums: HashSet<String> = HashSet::new();
    let mut seen_other_nums: HashSet<String> = HashSet::new();

    if let Ok(entries) = fs::read_dir(&folder) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = path.file_name().unwrap().to_string_lossy().to_string();
                
                if let Ok(files) = fs::read_dir(&path) {
                    for file in files.flatten() {
                        let file_path = file.path();
                        if !file_path.is_file() { continue; }
                        
                        let filename = file_path.file_name().unwrap().to_string_lossy().to_string();
                        let name_without_ext = file_path.file_stem().unwrap().to_string_lossy().to_string();
                        
                        if let Some((number, title)) = name_without_ext.split_once(' ') {
                            let number = number.to_string();
                            let title = title.to_string();

                            if title.chars().count() > 30 {
                                errors.push(ValidationError {
                                    filename: format!("{}/{}", dir_name, filename),
                                    message: format!("Tytuł ma {} znaków (maksymalnie 30)", title.chars().count()),
                                });
                            }

                            let is_duplicate = if dir_name == "playlist_dir" {
                                !seen_playlist_nums.insert(number.clone())
                            } else if dir_name == "screen_dir" {
                                !seen_screen_nums.insert(number.clone())
                            } else {
                                !seen_other_nums.insert(number.clone())
                            };

                            if is_duplicate {
                                let domain = if dir_name == "playlist_dir" { "playlistach" }
                                             else if dir_name == "screen_dir" { "ekranach" }
                                             else { "pozostałych pieśniach" };
                                             
                                errors.push(ValidationError {
                                    filename: format!("{}/{}", dir_name, filename),
                                    message: format!("Zduplikowany numer [{}] w {}", number, domain),
                                });
                            }

                            let song = Song { number, title, filename };

                            if dir_name == "playlist_dir" {
                                playlists.push(song);
                            } else if dir_name == "screen_dir" {
                                screens.push(song);
                            } else {
                                categories.entry(dir_name.clone()).or_insert_with(Vec::new).push(song);
                            }
                        }
                    }
                }
            }
        }
    }

    categories.retain(|_, v| !v.is_empty());
    Some(ParseResult { path: path_str, errors, playlists, screens, categories })
}

#[tauri::command]
fn read_file_content(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        // DODANO: get_drives (to naprawia błąd ładowania dysków)
        .invoke_handler(tauri::generate_handler![get_drives, load_sd_card, open_in_explorer, read_file_content])
        .run(tauri::generate_context!())
        .expect("Błąd podczas uruchamiania aplikacji Rduch LED!");
}