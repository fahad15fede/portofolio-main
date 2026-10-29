#!/usr/bin/env node

/**
 * Media Manifest Generator
 * 
 * Scans the assets/media/ directory and generates a media.json manifest
 * that lists all available images and videos for each project.
 * 
 * Supported formats: .jpg, .jpeg, .png, .webp, .mp4
 * 
 * Usage: node generate-media-manifest.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const MEDIA_DIR = path.join(__dirname, 'assets', 'media');
const OUTPUT_FILE = path.join(MEDIA_DIR, 'media.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.mp4'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4'];

/**
 * Check if a file has a supported media extension
 */
function isSupportedMedia(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Determine media type based on file extension
 */
function getMediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'unknown';
}

/**
 * Generate alt text from filename (remove extension and format)
 */
function generateAltText(filename, projectName) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  // Convert to readable format: "Screen Recording 2026-10-11 211030" -> "Screen Recording"
  const cleaned = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove dates
    .replace(/\d{6,}/g, '') // Remove long numbers
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || `${projectName} media`;
}

/**
 * Scan a project directory and return media items
 */
function scanProjectDirectory(projectName, projectPath) {
  const mediaItems = [];
  
  try {
    const files = fs.readdirSync(projectPath);
    
    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const stats = fs.statSync(filePath);
      
      // Skip directories and non-media files
      if (!stats.isFile() || !isSupportedMedia(file)) {
        continue;
      }
      
      // Skip placeholder files
      if (file.toLowerCase().includes('place') && file.toLowerCase().includes('here')) {
        console.log(`  Skipping placeholder: ${file}`);
        continue;
      }
      
      const mediaType = getMediaType(file);
      const relativePath = path.join('assets', 'media', projectName, file).replace(/\\/g, '/');
      const altText = generateAltText(file, projectName);
      
      mediaItems.push({
        path: relativePath,
        type: mediaType,
        alt: altText
      });
      
      console.log(`  Found ${mediaType}: ${file}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${projectPath}: ${error.message}`);
  }
  
  return mediaItems;
}

/**
 * Main function to generate the manifest
 */
function generateManifest() {
  console.log('Generating media manifest...\n');
  
  // Check if media directory exists
  if (!fs.existsSync(MEDIA_DIR)) {
    console.error(`Error: Media directory not found at ${MEDIA_DIR}`);
    process.exit(1);
  }
  
  const manifest = {};

  try {
    const previousManifest = fs.existsSync(OUTPUT_FILE)
      ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
      : {};
    const projects = fs.readdirSync(MEDIA_DIR);
    
    for (const project of projects) {
      const projectPath = path.join(MEDIA_DIR, project);
      const stats = fs.statSync(projectPath);
      
      // Skip non-directories and the manifest file itself
      if (!stats.isDirectory()) {
        continue;
      }
      
      console.log(`Scanning project: ${project}`);
      const mediaItems = scanProjectDirectory(project, projectPath);
      const youtubeItems = Array.isArray(previousManifest[project])
        ? previousManifest[project].filter(item =>
          item.type === 'youtube' && typeof item.videoId === 'string'
        )
        : [];
      mediaItems.push(...youtubeItems);
      
      // Only add projects with media items
      if (mediaItems.length > 0) {
        manifest[project] = mediaItems;
        console.log(`  Total: ${mediaItems.length} media item(s)\n`);
      } else {
        console.log(`  No media files found\n`);
        manifest[project] = [];
      }
    }
    
    // Write manifest to file
    const manifestJson = JSON.stringify(manifest, null, 2).replace(/\n/g, os.EOL);
    fs.writeFileSync(OUTPUT_FILE, manifestJson, 'utf8');
    
    console.log(`✓ Manifest generated successfully: ${OUTPUT_FILE}`);
    console.log(`✓ Projects found: ${Object.keys(manifest).length}`);
    console.log(`✓ Total media items: ${Object.values(manifest).flat().length}`);
    
  } catch (error) {
    console.error(`Error generating manifest: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest, scanProjectDirectory, getMediaType, isSupportedMedia };
