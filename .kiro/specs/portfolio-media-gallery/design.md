# Design Document: Portfolio Media Gallery

## Overview

This design specifies the implementation of two major enhancements to an existing HTML/CSS/JavaScript portfolio website: a dynamic media gallery system for project showcases and an interactive crosshair cursor effect for the LookOut AI project. The solution must work as a static site deployed on Vercel without server-side file listing capabilities.

### Current State

The portfolio is a single-file HTML application (`index.html`) with inline CSS and JavaScript. It features:
- A monochrome black/white/grey/silver design aesthetic
- A glass pivot door hero with Red John easter egg
- Four project showcases: LookOut AI, VIPER, Traffic Crash Severity AI, Email Spam Detector AI
- Media folders organized under `assets/media/{project-name}/`
- Hardcoded video references for some projects
- Existing interactive elements (door animation, mobile menu)

### Design Goals

1. **Dynamic Media Discovery**: Replace hardcoded media references with a manifest-driven system that displays exactly the number of available media items per project
2. **Adaptive Layout**: Create responsive gallery grids that handle variable media counts gracefully
3. **Lightbox Experience**: Provide full-screen media viewing with keyboard and touch navigation
4. **LookOut AI Crosshair**: Implement an interactive targeting reticle effect that enhances the AI surveillance project aesthetic
5. **Feature Preservation**: Ensure all existing functionality remains intact
6. **Static Deployment**: Maintain compatibility with Vercel's static hosting environment

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                   Static HTML Page                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Project Showcase Sections               │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      Dynamic Media Gallery                 │  │  │
│  │  │  • Manifest Loader                         │  │  │
│  │  │  • Grid Renderer                           │  │  │
│  │  │  • Lazy Load Manager                       │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      Lightbox Component                    │  │  │
│  │  │  • Full-screen Overlay                     │  │  │
│  │  │  • Navigation Controls                     │  │  │
│  │  │  • Keyboard Handler                        │  │  │
│  │  │  • Touch Gesture Support                   │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  LookOut AI Crosshair Effect (conditional) │  │  │
│  │  │  • Cursor Tracker                          │  │  │
│  │  │  • Animation Engine                        │  │  │
│  │  │  • Boundary Detection                      │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          ↓                              ↓
┌───────────────────┐          ┌──────────────────────┐
│  Media Manifest   │          │  Existing HTML/CSS   │
│  (media.json)     │          │  & JavaScript        │
│  • Project mapping│          │  • Door animation    │
│  • File paths     │          │  • Red John easter   │
│  • Media types    │          │  • Mobile menu       │
│  • Alt text       │          │  • Scroll behavior   │
└───────────────────┘          └──────────────────────┘
```

### Component Interaction Flow

1. **Page Load**: HTML renders with gallery placeholder containers
2. **Manifest Loading**: JavaScript fetches and parses `assets/media/media.json`
3. **Gallery Rendering**: For each project, the system:
   - Retrieves media list from manifest
   - Creates responsive thumbnail grid
   - Applies lazy loading to images
   - Attaches click handlers for lightbox
4. **User Interaction**: When user clicks media thumbnail:
   - Lightbox opens with full-resolution media
   - Navigation controls appear (if multiple items)
   - Keyboard and touch handlers activate
5. **Crosshair Effect** (LookOut AI only):
   - Detects cursor entry to showcase bounds
   - Tracks mouse position via `requestAnimationFrame`
   - Applies targeting animations on hover over main visual
   - Removes effect on cursor exit

## Components and Interfaces

### 1. Media Manifest Loader

**Responsibility**: Fetch and parse the media manifest file, validate structure, and provide media data to gallery components.

**Interface**:
```javascript
class MediaManifestLoader {
  async loadManifest(manifestPath)
  // Returns: Promise<ManifestData>
  // Throws: Error if JSON invalid or fetch fails
  
  validateManifest(data)
  // Returns: boolean
  // Validates JSON structure
  
  getProjectMedia(projectName)
  // Returns: Array<MediaItem> | null
  // Retrieves media items for specific project
}
```

**Key Methods**:
- `loadManifest(manifestPath)`: Fetches JSON from specified path, parses, and stores internally
- `validateManifest(data)`: Checks that data has expected structure (projects as keys, arrays as values)
- `getProjectMedia(projectName)`: Returns array of media items for given project, or null if project has no media

**Error Handling**:
- Network errors: Log to console, return empty manifest
- Parse errors: Log to console, return empty manifest
- Invalid structure: Log warning, attempt to extract valid portions

### 2. Gallery Renderer

**Responsibility**: Generate HTML for thumbnail grids based on manifest data, apply styles, and attach event listeners.

**Interface**:
```javascript
class GalleryRenderer {
  constructor(containerSelector, manifestLoader)
  
  renderProject(projectName)
  // Returns: void
  // Renders gallery for specified project
  
  createThumbnail(mediaItem, index)
  // Returns: HTMLElement
  // Creates thumbnail element for image or video
  
  attachLightboxHandlers()
  // Returns: void
  // Attaches click handlers to thumbnails
}
```

**Key Methods**:
- `renderProject(projectName)`: Queries manifest for project media, creates thumbnail grid, inserts into container
- `createThumbnail(mediaItem, index)`: Returns `<figure>` or `<div>` element with thumbnail image/video poster, data attributes for lightbox
- `attachLightboxHandlers()`: Adds click event listeners that trigger lightbox opening

**Grid Layout Logic**:
- 1 item: Single centered element
- 2 items: Two-column grid
- 3 items: Three-column grid or 2+1 layout
- 4+ items: Responsive grid (3 columns desktop, 2 mobile, 1 small mobile)

### 3. Lazy Load Manager

**Responsibility**: Defer loading of thumbnail images until they enter the viewport, improving initial page load performance.

**Interface**:
```javascript
class LazyLoadManager {
  constructor()
  
  observe(imageElement)
  // Returns: void
  // Registers image for lazy loading
  
  disconnect()
  // Returns: void
  // Stops observing all images
}
```

**Implementation**:
- Uses `IntersectionObserver` API
- Observes images with `data-src` attribute
- On intersection: copies `data-src` to `src`, loads image
- Maintains loading placeholder until image loads

### 4. Lightbox Component

**Responsibility**: Display media in full-screen overlay with navigation controls, handle keyboard/touch input, manage video playback.

**Interface**:
```javascript
class Lightbox {
  constructor()
  
  open(mediaItems, startIndex)
  // Returns: void
  // Opens lightbox with media array starting at index
  
  close()
  // Returns: void
  // Closes lightbox, cleans up state
  
  next()
  // Returns: void
  // Navigate to next media item
  
  previous()
  // Returns: void
  // Navigate to previous media item
  
  showMedia(index)
  // Returns: void
  // Display media at specified index
}
```

**Key Methods**:
- `open(mediaItems, startIndex)`: Creates lightbox overlay DOM, displays media at index, shows navigation controls
- `close()`: Removes lightbox from DOM, pauses videos, removes event listeners
- `next()` / `previous()`: Update current index (with wrapping), call `showMedia()`
- `showMedia(index)`: Updates lightbox content with image or video element, updates navigation state

**Event Handling**:
- Escape key: Close lightbox
- Left/Right arrow keys: Navigate between items
- Click outside media: Close lightbox
- Touch swipe: Navigate (mobile)

**Video Behavior**:
- Display HTML5 `<video>` with controls
- No autoplay with sound
- Pause on navigation or close

### 5. Crosshair Effect

**Responsibility**: Display custom targeting reticle cursor within LookOut AI showcase bounds, track cursor smoothly, apply animations on hover.

**Interface**:
```javascript
class CrosshairEffect {
  constructor(showcaseElement)
  
  initialize()
  // Returns: void
  // Creates crosshair DOM, attaches event listeners
  
  updatePosition(x, y)
  // Returns: void
  // Updates crosshair position via transform
  
  activateScanning()
  // Returns: void
  // Applies scanning animation when hovering over main visual
  
  deactivateScanning()
  // Returns: void
  // Removes scanning animation
  
  destroy()
  // Returns: void
  // Removes crosshair, cleans up listeners
}
```

**Key Methods**:
- `initialize()`: Creates crosshair HTML structure (corner marks, center dot, tracking ring, status text), appends to showcase, binds mouse events
- `updatePosition(x, y)`: Uses `requestAnimationFrame` to update crosshair position smoothly via CSS `transform`
- `activateScanning()` / `deactivateScanning()`: Toggles CSS classes that trigger expansion/contraction animations and detection brackets
- `destroy()`: Removes crosshair DOM and event listeners

**Crosshair Structure**:
```html
<div class="crosshair-overlay">
  <div class="crosshair-reticle">
    <div class="corner-mark top-left"></div>
    <div class="corner-mark top-right"></div>
    <div class="corner-mark bottom-left"></div>
    <div class="corner-mark bottom-right"></div>
    <div class="center-dot"></div>
    <div class="tracking-ring"></div>
  </div>
  <div class="crosshair-status">TRACKING</div>
</div>
```

**Animation Details**:
- Default state: Static reticle with subtle pulse on tracking ring
- Hover state: Reticle expands 10%, tracking ring rotates, detection brackets appear at corners
- Status text cycles: "TRACKING" → "TARGET LOCK" → "VISION ACTIVE"

**Accessibility Considerations**:
- Disabled on touch devices (check `matchMedia('(pointer: fine)')`)
- Disabled when `prefers-reduced-motion` is enabled
- Uses `pointer-events: none` on decorative elements
- Does not interfere with click targets (links, buttons, video controls)

## Data Models

### Media Manifest Structure

The media manifest is a JSON file located at `assets/media/media.json` with the following structure:

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
      "alt": "VIPER language syntax example"
    },
    {
      "path": "assets/media/viper/v2.png",
      "type": "image",
      "alt": "VIPER compiler architecture"
    },
    {
      "path": "assets/media/viper/v3.png",
      "type": "image",
      "alt": "VIPER grammar specification"
    },
    {
      "path": "assets/media/viper/vv1.mp4",
      "type": "video",
      "alt": "VIPER demo video"
    }
  ],
  "traffic-crash": [
    {
      "path": "assets/media/traffic-crash/Screen Recording 2026-10-11 211030.mp4",
      "type": "video",
      "alt": "Traffic Crash Severity AI demo"
    },
    {
      "path": "assets/media/traffic-crash/Screenshot 2026-10-11 210800.png",
      "type": "image",
      "alt": "Crash severity prediction interface"
    },
    {
      "path": "assets/media/traffic-crash/Screenshot 2026-10-11 211059.png",
      "type": "image",
      "alt": "Model accuracy comparison"
    },
    {
      "path": "assets/media/traffic-crash/Screenshot 2026-10-11 211134.png",
      "type": "image",
      "alt": "Feature importance visualization"
    }
  ],
  "spam-detector": [
    {
      "path": "assets/media/spam-detector/Screen Recording 2026-10-11 204628.mp4",
      "type": "video",
      "alt": "Spam detector demo"
    },
    {
      "path": "assets/media/spam-detector/Screenshot 2026-10-11 204208.png",
      "type": "image",
      "alt": "Email classification interface"
    },
    {
      "path": "assets/media/spam-detector/Screenshot 2026-10-11 204353.png",
      "type": "image",
      "alt": "Model training results"
    },
    {
      "path": "assets/media/spam-detector/Screenshot 2026-10-11 204407.png",
      "type": "image",
      "alt": "Confusion matrix"
    },
    {
      "path": "assets/media/spam-detector/Screenshot 2026-10-11 204419.png",
      "type": "image",
      "alt": "API endpoint testing"
    }
  ]
}
```

**Schema**:
- Top level: Object with project names as keys
- Project keys: Match `data-media` attribute in HTML showcase elements
- Media arrays: Each contains objects with:
  - `path` (string, required): Relative path from project root
  - `type` (string, required): Either "image" or "video"
  - `alt` (string, optional): Alternative text for accessibility

### MediaItem Interface

```typescript
interface MediaItem {
  path: string;      // e.g., "assets/media/viper/v1.png"
  type: "image" | "video";
  alt?: string;      // Optional alt text
}
```

### ManifestData Interface

```typescript
interface ManifestData {
  [projectName: string]: MediaItem[];
}
```

### Gallery Configuration

Each gallery is associated with a showcase element via the `data-media` attribute:

```html
<div class="media-showcase" data-media="viper">
  <!-- Gallery will be rendered here -->
</div>
```

The JavaScript uses this attribute to:
1. Query the manifest for matching project name
2. Render thumbnails into the showcase container
3. Skip rendering if no media exists for that project


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Manifest Loading and Project Data Extraction

*For any* valid Media_Manifest JSON file, when the Gallery_System loads the manifest, it SHALL successfully parse the JSON and extract media arrays for all projects defined in the manifest.

**Validates: Requirements 1.1, 1.2**

### Property 2: Supported File Format Recognition

*For any* media item with extensions .jpg, .jpeg, .png, .webp, or .mp4, the Gallery_System SHALL recognize and process the file as a valid media item.

**Validates: Requirements 1.3**

### Property 3: Variable Media Count Handling

*For any* project with 0 to N media items (where N is any positive integer), the Gallery_System SHALL render an appropriate gallery layout or render no gallery section when N equals 0.

**Validates: Requirements 1.4, 2.3**

### Property 4: Graceful Error Handling for Missing Files

*For any* media item with an invalid or missing file path, when the Gallery_System attempts to load the file, it SHALL handle the error gracefully without displaying broken image icons or crashing the page.

**Validates: Requirements 1.5**

### Property 5: Malformed JSON Rejection

*For any* malformed or invalid JSON data, when the Gallery_System attempts to parse the manifest, it SHALL reject the data, log an error, and continue with an empty manifest state.

**Validates: Requirements 2.4**

### Property 6: Responsive Grid Layout Adaptation

*For any* number of media items N where N ≥ 1, the Gallery_System SHALL render a responsive grid with column count that adapts appropriately (1 item = centered single, 2 items = two-column, 3+ items = multi-column responsive grid).

**Validates: Requirements 3.1**

### Property 7: Mobile Grid Column Adjustment

*For any* gallery rendered at mobile viewport widths (≤ 760px), the grid SHALL reduce column count to maintain readability and usability.

**Validates: Requirements 3.3**

### Property 8: Lightbox Opening and Media Display

*For any* image or video thumbnail, when clicked, the Lightbox SHALL open displaying the corresponding full-resolution media item.

**Validates: Requirements 4.1, 5.1**

### Property 9: Lightbox Navigation and Closure

*For any* open Lightbox, the system SHALL provide navigation controls when multiple items exist, close on Escape key press, close on outside click, and support left/right arrow key navigation between items.

**Validates: Requirements 4.2, 4.3, 4.4, 11.1**

### Property 10: Video Playback Configuration

*For any* video opened in the Lightbox, the video element SHALL have controls enabled and autoplay with sound disabled.

**Validates: Requirements 5.2, 5.3**

### Property 11: Video Pause on Navigation

*For any* playing video in the Lightbox, when the user navigates to another item or closes the Lightbox, the video SHALL pause playback.

**Validates: Requirements 5.4**

### Property 12: Lazy Loading Activation

*For any* image thumbnail that is initially below the viewport, the image SHALL load only when it enters the viewport through scrolling.

**Validates: Requirements 6.1, 6.2**

### Property 13: Crosshair Visibility Within Showcase Bounds

*For any* cursor position, the Crosshair_Effect SHALL be visible if and only if the cursor is within the LookOut AI showcase boundaries and on a non-touch device.

**Validates: Requirements 7.1, 7.6**

### Property 14: Crosshair Position Tracking

*For any* cursor movement within the LookOut AI showcase, the Crosshair_Effect SHALL update its position to match the cursor coordinates using requestAnimationFrame for smooth tracking.

**Validates: Requirements 7.3**

### Property 15: Crosshair Status Text Display

*For any* active Crosshair_Effect, the status text SHALL display one of the valid states: "TRACKING", "TARGET LOCK", or "VISION ACTIVE".

**Validates: Requirements 7.4**

### Property 16: Crosshair Hover Animations

*For any* cursor position over the main LookOut visual element, the Crosshair_Effect SHALL activate scanning animations including reticle expansion/contraction and detection corner brackets.

**Validates: Requirements 7.5**

### Property 17: Crosshair Non-Interference with Interactive Elements

*For any* interactive element (link, button, video control) within the LookOut AI showcase, clicks SHALL reach the underlying element without being blocked by the crosshair overlay.

**Validates: Requirements 7.8**

### Property 18: Touch Device Detection

*For any* device identified as a touch device (matchMedia '(pointer: coarse)'), the Crosshair_Effect SHALL NOT initialize.

**Validates: Requirements 8.1**

### Property 19: Reduced-Motion Support

*For any* user with prefers-reduced-motion enabled, the Crosshair_Effect scanning animations SHALL be disabled.

**Validates: Requirements 8.2**

### Property 20: Crosshair Scroll Alignment

*For any* scroll position change while the cursor is within the LookOut AI showcase, the Crosshair_Effect position SHALL remain accurately aligned with the cursor without drift.

**Validates: Requirements 8.3**

### Property 21: Client-Side Only Operation

*For any* gallery initialization and rendering operation, the Gallery_System SHALL NOT make server-side API calls or require server-side file listing (excluding the initial manifest fetch and media file requests).

**Validates: Requirements 10.1**

### Property 22: Keyboard Accessibility

*For any* gallery thumbnail or lightbox control, when a user navigates using the Tab key, the element SHALL receive focus and be keyboard accessible.

**Validates: Requirements 11.3**

### Property 23: Focus Indicator Visibility

*For any* focused gallery element or lightbox control, a visible focus indicator SHALL be displayed to show the current keyboard focus position.

**Validates: Requirements 11.4**

### Property 24: Touch Gesture Navigation

*For any* open Lightbox on a touch device with multiple media items, swipe left/right gestures SHALL navigate between media items.

**Validates: Requirements 11.2**

### Property 25: Build Script File Discovery

*For any* directory structure under assets/media/{project-name}/ containing files with supported extensions, the build script SHALL discover all media files, correctly identify their type (image or video based on extension), and generate a valid Media_Manifest JSON file with correct paths.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 26: Error Logging Without Page Crashes

*For any* error condition (missing files, invalid manifest, load failures), the Gallery_System SHALL log errors to the console without causing the page to crash or become non-functional.

**Validates: Requirements 14.1**

### Property 27: No Console Errors During Normal Operation

*For any* normal user interaction flow (loading manifest, rendering galleries, opening lightbox, navigating media, closing lightbox), the Gallery_System SHALL produce no console errors.

**Validates: Requirements 14.4**

### Property 28: Existing Feature Preservation

*For any* existing portfolio feature (glass door animation, Red John easter egg, navigation buttons, project descriptions, links, sections), these features SHALL continue to function correctly after Gallery_System initialization.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

## Error Handling

### Gallery System Error Handling

1. **Manifest Load Failures**:
   - Network errors: Log to console with descriptive message, initialize with empty manifest
   - JSON parse errors: Log syntax error details, initialize with empty manifest
   - Invalid structure: Log validation warnings, extract any valid portions, skip invalid projects

2. **Media Load Failures**:
   - Images: Remove broken image element, optionally show text placeholder
   - Videos: Display message indicating video unavailable
   - Both: Log error with file path for debugging

3. **DOM Manipulation Errors**:
   - Missing container elements: Log warning, skip rendering for that project
   - Selector conflicts: Use specific selectors with fallbacks

### Lightbox Error Handling

1. **Invalid Media Index**: Clamp index to valid range [0, mediaItems.length - 1]
2. **Missing Media Items**: Close lightbox, log error
3. **Event Listener Failures**: Use try-catch for event handler registration, log failures

### Crosshair Error Handling

1. **Missing Showcase Element**: Skip crosshair initialization, log warning
2. **Animation Frame Issues**: Use fallback to setTimeout if requestAnimationFrame unavailable
3. **Media Query Failures**: Default to desktop behavior if media queries fail

### Build Script Error Handling

1. **Directory Access Errors**: Log error with path, exit with non-zero code
2. **File Read Errors**: Skip problematic files, continue with others, log warnings
3. **JSON Write Errors**: Catch and report write failures, preserve existing manifest if possible

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together these provide comprehensive coverage

### Unit Testing Focus

Unit tests should cover:

1. **Specific Examples**:
   - Gallery with exactly 1 image loads correctly
   - Gallery with empty array shows no section
   - Lightbox opens on thumbnail click
   - Escape key closes lightbox
   - Video controls are present
   - Crosshair appears in LookOut showcase
   - Glass door animation still works after gallery init

2. **Edge Cases**:
   - Manifest with empty project arrays
   - Media items with very long file paths
   - Rapid clicking on thumbnails
   - Rapid keyboard navigation in lightbox
   - Browser back button while lightbox open
   - Window resize during lightbox display

3. **Error Conditions**:
   - Malformed JSON manifest
   - 404 errors for media files
   - Missing alt text
   - Invalid file extensions
   - Missing crosshair container

4. **Integration Points**:
   - Multiple galleries on same page
   - Interaction between lightbox and existing modal elements
   - Gallery rendering with existing media showcase HTML
   - Crosshair doesn't interfere with video controls

### Property-Based Testing Configuration

**Testing Library**: Use `fast-check` for JavaScript property-based testing (minimum 100 iterations per test)

**Property Test Examples**:

1. **Manifest Parsing Property** (Property 1):
   ```javascript
   // Feature: portfolio-media-gallery, Property 1: Manifest Loading and Project Data Extraction
   fc.assert(
     fc.property(
       fc.dictionary(fc.string(), fc.array(mediaItemArbitrary)),
       (manifestData) => {
         const loader = new MediaManifestLoader();
         const parsed = loader.validateManifest(manifestData);
         return parsed === true && 
                Object.keys(manifestData).every(project => 
                  Array.isArray(loader.getProjectMedia(project))
                );
       }
     ),
     { numRuns: 100 }
   );
   ```

2. **Variable Media Count Property** (Property 3):
   ```javascript
   // Feature: portfolio-media-gallery, Property 3: Variable Media Count Handling
   fc.assert(
     fc.property(
       fc.integer({ min: 0, max: 100 }),
       fc.string(),
       (mediaCount, projectName) => {
         const renderer = new GalleryRenderer(`.showcase[data-media="${projectName}"]`, mockLoader);
         const mediaItems = Array(mediaCount).fill(null).map((_, i) => ({
           path: `test${i}.jpg`,
           type: 'image'
         }));
         
         mockLoader.setProjectMedia(projectName, mediaItems);
         renderer.renderProject(projectName);
         
         const container = document.querySelector(`[data-media="${projectName}"]`);
         if (mediaCount === 0) {
           return container.querySelector('.media-gallery') === null;
         } else {
           const thumbnails = container.querySelectorAll('.media-thumbnail');
           return thumbnails.length === mediaCount;
         }
       }
     ),
     { numRuns: 100 }
   );
   ```

3. **Crosshair Visibility Property** (Property 13):
   ```javascript
   // Feature: portfolio-media-gallery, Property 13: Crosshair Visibility Within Showcase Bounds
   fc.assert(
     fc.property(
       fc.integer({ min: -100, max: 1000 }),
       fc.integer({ min: -100, max: 1000 }),
       (x, y) => {
         const showcase = { left: 0, top: 0, right: 800, bottom: 600 };
         const isInBounds = x >= showcase.left && x <= showcase.right && 
                           y >= showcase.top && y <= showcase.bottom;
         
         const crosshair = new CrosshairEffect(mockShowcaseElement);
         simulateMouseMove(x, y);
         
         const crosshairElement = document.querySelector('.crosshair-overlay');
         const isVisible = crosshairElement && 
                          window.getComputedStyle(crosshairElement).display !== 'none';
         
         return isInBounds === isVisible;
       }
     ),
     { numRuns: 100 }
   );
   ```

4. **Lightbox Navigation Property** (Property 9):
   ```javascript
   // Feature: portfolio-media-gallery, Property 9: Lightbox Navigation and Closure
   fc.assert(
     fc.property(
       fc.array(mediaItemArbitrary, { minLength: 1, maxLength: 20 }),
       fc.integer({ min: 0 }),
       (mediaItems, startIndex) => {
         const index = startIndex % mediaItems.length;
         const lightbox = new Lightbox();
         lightbox.open(mediaItems, index);
         
         // Test navigation
         if (mediaItems.length > 1) {
           const hasControls = document.querySelectorAll('.lightbox-nav-btn').length === 2;
           if (!hasControls) return false;
         }
         
         // Test Escape key
         simulateKeyPress('Escape');
         const closedAfterEscape = !document.querySelector('.lightbox-overlay');
         
         return closedAfterEscape;
       }
     ),
     { numRuns: 100 }
   );
   ```

5. **Error Handling Property** (Property 26):
   ```javascript
   // Feature: portfolio-media-gallery, Property 26: Error Logging Without Page Crashes
   fc.assert(
     fc.property(
       fc.oneof(
         fc.constant(null),
         fc.constant(undefined),
         fc.constant('invalid json'),
         fc.object()
       ),
       (invalidData) => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
         const loader = new MediaManifestLoader();
         
         try {
           loader.validateManifest(invalidData);
           // Should not throw
           return true;
         } catch (e) {
           // If it throws, the test fails
           return false;
         } finally {
           consoleSpy.mockRestore();
         }
       }
     ),
     { numRuns: 100 }
   );
   ```

### Test Organization

```
tests/
├── unit/
│   ├── gallery-renderer.test.js
│   ├── lightbox.test.js
│   ├── crosshair-effect.test.js
│   ├── lazy-load-manager.test.js
│   └── manifest-loader.test.js
├── property/
│   ├── manifest-properties.test.js
│   ├── gallery-properties.test.js
│   ├── lightbox-properties.test.js
│   └── crosshair-properties.test.js
├── integration/
│   ├── full-gallery-flow.test.js
│   ├── existing-features.test.js
│   └── multi-project.test.js
└── build/
    └── manifest-generation.test.js
```

### Testing Notes

- Use JSDOM or similar for DOM testing in Node.js environment
- Mock IntersectionObserver for lazy loading tests
- Mock requestAnimationFrame for crosshair animation tests
- Use actual media files (small test images/videos) for integration tests
- Test responsive behavior using viewport manipulation
- Verify no memory leaks when opening/closing lightbox repeatedly
- Test keyboard navigation with screen reader simulation tools

