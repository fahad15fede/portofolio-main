# Media Gallery Guide

## Adding New Media Files

Your portfolio now has a dynamic media gallery system that automatically discovers and displays images and videos for each project.

### Step 1: Add Your Files

Place your media files in the appropriate project folder:

```
assets/media/
├── lookout/          # LookOut AI project media
├── viper/            # VIPER Language project media
├── traffic-crash/    # Traffic Crash Severity AI media
└── spam-detector/    # Email Spam Detector AI media
```

### Step 2: Supported Formats

The system supports:
- **Images**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Videos**: `.mp4`
- **YouTube videos**: add a `youtube` media item with its `videoId` to `assets/media/media.json`. The generator preserves these entries.

### Step 3: Generate the Manifest

After adding files, regenerate the media manifest by running:

```bash
npm run generate-manifest
```

Or manually:

```bash
node generate-media-manifest.js
```

This script will:
- Scan all project directories
- Discover all supported media files
- Generate `assets/media/media.json` automatically
- Skip placeholder files

### Step 4: Deploy to Vercel

When you push to GitHub, Vercel will automatically:
1. Run the build script (`node generate-media-manifest.js`)
2. Generate the media manifest
3. Deploy your portfolio with all media galleries

## Media Manifest Structure

The `assets/media/media.json` file looks like this:

```json
{
  "lookout": [
    {
      "path": "assets/media/lookout/poster.jpg",
      "type": "image",
      "alt": "LookOut AI detection interface"
    }
  ],
  "viper": [
    {
      "path": "assets/media/viper/v1.png",
      "type": "image",
      "alt": "VIPER language syntax"
    },
    {
      "type": "youtube",
      "videoId": "HCNPBd5H8bY",
      "alt": "VIPER demo video"
    }
  ]
}
```

### Manual Editing

If needed, you can manually edit `assets/media/media.json`:
- Each project is a key (e.g., "lookout", "viper")
- Media items must have:
  - `path`: relative file path from project root
  - `type`: "image", "video", or "youtube"
  - `alt`: (optional) description for accessibility
- YouTube items use `videoId` instead of `path`.

## Gallery Features

### For Visitors

- **Responsive Grid**: Automatically adapts to screen size
- **Lazy Loading**: Images load only when entering viewport
- **Lightbox Viewer**: Click to view full-screen with navigation
- **Keyboard Navigation**: Use arrow keys to navigate in lightbox, Escape to close
- **Touch Support**: Swipe gestures on mobile devices
- **Video Controls**: HTML5 controls for video playback

### LookOut AI Crosshair Effect

When you hover over the LookOut AI project visual:
- A custom targeting crosshair appears
- It tracks your cursor smoothly
- Shows rotating status: TRACKING → TARGET LOCK → VISION ACTIVE
- Works on desktop only (disabled on touch devices)
- Respects reduced-motion preferences

## Troubleshooting

### Gallery not showing media?

1. Check that files are in the correct folder
2. Run `npm run generate-manifest`
3. Verify `assets/media/media.json` exists and contains your files
4. Check browser console for errors

### Media not loading?

1. Verify file paths are correct
2. Ensure files have supported extensions
3. Check that files are not corrupted
4. Verify file permissions

### Crosshair not visible?

1. Make sure you're on desktop (disabled on touch devices)
2. Hover over the LookOut AI visual
3. Check that JavaScript is enabled
4. Verify browser console for errors

## Local Development

To test locally before deploying:

```bash
# Generate manifest
node generate-media-manifest.js

# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

## Vercel Configuration

The `vercel.json` file is already configured to run the build script automatically. No additional setup needed!
