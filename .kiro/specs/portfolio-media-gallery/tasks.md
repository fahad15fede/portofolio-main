# Implementation Plan: Portfolio Media Gallery

## Overview

This implementation plan breaks down the portfolio media gallery enhancement into incremental coding tasks. The approach prioritizes building the media manifest generation first, then the gallery system, followed by the lightbox, and finally the crosshair effect. Each major component includes testing sub-tasks to validate correctness properties from the design document.

## Tasks

- [x] 1. Create media manifest generation script
  - Create Node.js script that scans assets/media/ directories
  - Discover all files with supported extensions (.jpg, .jpeg, .png, .webp, .mp4)
  - Generate valid media.json manifest with correct structure
  - Identify file types based on extensions (image vs video)
  - Handle errors gracefully (log warnings, continue processing)
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ]* 1.1 Write property test for manifest generation
  - **Property 25: Build Script File Discovery**
  - **Validates: Requirements 12.1, 12.2, 12.3**

- [ ] 2. Implement media manifest loader component
  - [x] 2.1 Create MediaManifestLoader class
    - Implement async loadManifest(manifestPath) method
    - Add validateManifest(data) method for structure validation
    - Add getProjectMedia(projectName) method to retrieve project-specific media
    - Handle fetch errors, JSON parse errors, and validation failures
    - _Requirements: 1.1, 1.2, 2.4_

  - [ ]* 2.2 Write property test for manifest loading
    - **Property 1: Manifest Loading and Project Data Extraction**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.3 Write property test for malformed JSON handling
    - **Property 5: Malformed JSON Rejection**
    - **Validates: Requirements 2.4**

- [ ] 3. Implement gallery renderer component
  - [x] 3.1 Create GalleryRenderer class
    - Implement constructor(containerSelector, manifestLoader)
    - Add renderProject(projectName) method
    - Add createThumbnail(mediaItem, index) method
    - Generate responsive grid HTML based on media count
    - Support variable numbers of media items (0 to N)
    - Apply monochrome aesthetic styles
    - _Requirements: 1.3, 1.4, 2.3, 3.1, 3.3_

  - [ ]* 3.2 Write property test for variable media count handling
    - **Property 3: Variable Media Count Handling**
    - **Validates: Requirements 1.4, 2.3**

  - [ ]* 3.3 Write property test for responsive grid adaptation
    - **Property 6: Responsive Grid Layout Adaptation**
    - **Validates: Requirements 3.1**

  - [ ]* 3.4 Write property test for mobile grid adjustment
    - **Property 7: Mobile Grid Column Adjustment**
    - **Validates: Requirements 3.3**

- [ ] 4. Implement lazy loading manager
  - [x] 4.1 Create LazyLoadManager class
    - Implement constructor with IntersectionObserver setup
    - Add observe(imageElement) method
    - Add disconnect() method
    - Use data-src attribute for lazy loaded images
    - Load images when entering viewport
    - _Requirements: 6.1, 6.2_

  - [ ]* 4.2 Write property test for lazy loading activation
    - **Property 12: Lazy Loading Activation**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 5. Implement lightbox component
  - [x] 5.1 Create Lightbox class structure
    - Implement constructor
    - Create lightbox HTML structure (overlay, media container, controls)
    - Add open(mediaItems, startIndex) method
    - Add close() method
    - Add showMedia(index) method
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Add lightbox navigation methods
    - Implement next() method
    - Implement previous() method
    - Handle index wrapping for circular navigation
    - Update navigation button visibility based on media count
    - _Requirements: 4.2_

  - [x] 5.3 Add lightbox event handlers
    - Attach Escape key handler to close lightbox
    - Attach click-outside-to-close handler
    - Attach left/right arrow key handlers for navigation
    - Add touch swipe gesture support for mobile
    - Ensure keyboard accessibility with Tab navigation
    - _Requirements: 4.3, 4.4, 11.1, 11.2, 11.3_

  - [x] 5.4 Implement video playback handling
    - Display HTML5 video elements with controls
    - Disable autoplay with sound
    - Pause video on navigation or close
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 5.5 Write property test for lightbox opening and display
    - **Property 8: Lightbox Opening and Media Display**
    - **Validates: Requirements 4.1, 5.1**

  - [ ]* 5.6 Write property test for lightbox navigation
    - **Property 9: Lightbox Navigation and Closure**
    - **Validates: Requirements 4.2, 4.3, 4.4, 11.1**

  - [ ]* 5.7 Write property test for video configuration
    - **Property 10: Video Playback Configuration**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 5.8 Write property test for video pause behavior
    - **Property 11: Video Pause on Navigation**
    - **Validates: Requirements 5.4**

  - [ ]* 5.9 Write property test for touch gesture navigation
    - **Property 24: Touch Gesture Navigation**
    - **Validates: Requirements 11.2**

- [ ] 6. Checkpoint - Gallery system validation
  - Ensure all gallery and lightbox tests pass
  - Manually verify galleries render correctly for all projects
  - Verify lightbox opens and navigates properly
  - Ask the user if questions arise

- [ ] 7. Implement crosshair effect component
  - [x] 7.1 Create CrosshairEffect class structure
    - Implement constructor(showcaseElement)
    - Create crosshair HTML structure (corner marks, center dot, tracking ring, status text)
    - Add initialize() method
    - Add destroy() method
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Implement crosshair position tracking
    - Add updatePosition(x, y) method using requestAnimationFrame
    - Attach pointermove event listener to showcase
    - Calculate cursor position relative to showcase bounds
    - Apply CSS transform to update crosshair position smoothly
    - Handle scroll events to maintain alignment
    - _Requirements: 7.3, 8.3_

  - [x] 7.3 Implement crosshair visibility and animations
    - Show crosshair when cursor enters LookOut showcase
    - Hide crosshair when cursor exits showcase
    - Detect hover over main visual element
    - Add activateScanning() method for hover state animations
    - Add deactivateScanning() method
    - Cycle status text between "TRACKING", "TARGET LOCK", "VISION ACTIVE"
    - _Requirements: 7.1, 7.4, 7.5, 7.6_

  - [x] 7.4 Add crosshair accessibility and device detection
    - Check for touch device using matchMedia('(pointer: fine)')
    - Skip initialization on touch devices
    - Check for prefers-reduced-motion media query
    - Disable animations when reduced motion preferred
    - Apply pointer-events: none to decorative crosshair elements
    - Ensure interactive elements remain clickable
    - _Requirements: 7.8, 8.1, 8.2, 8.4_

  - [ ]* 7.5 Write property test for crosshair visibility
    - **Property 13: Crosshair Visibility Within Showcase Bounds**
    - **Validates: Requirements 7.1, 7.6**

  - [ ]* 7.6 Write property test for crosshair position tracking
    - **Property 14: Crosshair Position Tracking**
    - **Validates: Requirements 7.3**

  - [ ]* 7.7 Write property test for crosshair status text
    - **Property 15: Crosshair Status Text Display**
    - **Validates: Requirements 7.4**

  - [ ]* 7.8 Write property test for hover animations
    - **Property 16: Crosshair Hover Animations**
    - **Validates: Requirements 7.5**

  - [ ]* 7.9 Write property test for non-interference with clicks
    - **Property 17: Crosshair Non-Interference with Interactive Elements**
    - **Validates: Requirements 7.8**

  - [ ]* 7.10 Write property test for touch device detection
    - **Property 18: Touch Device Detection**
    - **Validates: Requirements 8.1**

  - [ ]* 7.11 Write property test for reduced-motion support
    - **Property 19: Reduced-Motion Support**
    - **Validates: Requirements 8.2**

  - [ ]* 7.12 Write property test for scroll alignment
    - **Property 20: Crosshair Scroll Alignment**
    - **Validates: Requirements 8.3**

- [ ] 8. Integrate components into index.html
  - [x] 8.1 Add CSS styles for gallery system
    - Add thumbnail grid styles with responsive breakpoints
    - Add lightbox overlay and media display styles
    - Add navigation button styles
    - Add loading placeholder styles
    - Ensure monochrome aesthetic consistency
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 8.2 Add CSS styles for crosshair effect
    - Add crosshair overlay, reticle, and corner mark styles
    - Add tracking ring and status text styles
    - Add hover animation keyframes
    - Add scanning animation effects
    - Use white/grey/red color scheme
    - _Requirements: 7.2, 7.7_

  - [x] 8.3 Add JavaScript initialization code
    - Instantiate MediaManifestLoader on page load
    - Load manifest from assets/media/media.json
    - Query all showcase elements with data-media attributes
    - For each project, instantiate GalleryRenderer and render
    - Instantiate LazyLoadManager and observe gallery images
    - Instantiate Lightbox component
    - For LookOut AI showcase, instantiate CrosshairEffect
    - Add error handling to log issues without breaking page
    - _Requirements: 1.1, 1.2, 1.4, 7.1, 10.1_

  - [ ]* 8.4 Write property test for client-side only operation
    - **Property 21: Client-Side Only Operation**
    - **Validates: Requirements 10.1**

- [ ] 9. Add error handling and logging
  - [x] 9.1 Implement comprehensive error handling
    - Add try-catch blocks around manifest loading
    - Handle image load errors gracefully (no broken icons)
    - Handle video load errors with fallback messages
    - Log all errors to console with descriptive messages
    - Ensure page remains functional despite errors
    - _Requirements: 1.5, 14.1_

  - [ ]* 9.2 Write property test for error logging
    - **Property 26: Error Logging Without Page Crashes**
    - **Validates: Requirements 14.1**

  - [ ]* 9.3 Write property test for no console errors in normal operation
    - **Property 27: No Console Errors During Normal Operation**
    - **Validates: Requirements 14.4**

- [ ] 10. Implement keyboard accessibility features
  - Add tabindex to gallery thumbnails
  - Ensure lightbox controls are keyboard accessible
  - Add visible focus indicators (outline styles)
  - Test Tab navigation through galleries and lightbox
  - _Requirements: 11.3, 11.4_

- [ ]* 10.1 Write property test for keyboard accessibility
  - **Property 22: Keyboard Accessibility**
  - **Validates: Requirements 11.3**

- [ ]* 10.2 Write property test for focus indicators
  - **Property 23: Focus Indicator Visibility**
  - **Validates: Requirements 11.4**

- [ ] 11. Verify existing feature preservation
  - [ ]* 11.1 Write unit tests for existing feature preservation
    - Test glass door animation still works
    - Test Red John blur/clear transition
    - Test hero buttons and navigation
    - Test all project links (GitHub, live demo)
    - Test skills, education, contact sections
    - Test mobile responsive layouts
    - **Property 28: Existing Feature Preservation**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [x] 12. Run build script and generate initial manifest
  - Execute manifest generation script
  - Verify generated media.json is valid JSON
  - Verify all existing media files are discovered
  - Verify file paths are correct relative to project root
  - Verify image/video type classification is correct
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 13. Configure Vercel deployment
  - Update vercel.json or package.json if needed for build script
  - Ensure manifest generation runs during build
  - Verify static site deployment works
  - Test deployed site has all media and functionality
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 14. Create documentation
  - Write README section on adding new media files
  - Document media.json structure for manual edits
  - Document how to run build script to regenerate manifest
  - Add code comments to all JavaScript classes and methods
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 15. Final checkpoint - Complete testing and validation
  - Run all unit tests and property tests
  - Manually test all four project galleries
  - Test lightbox with images and videos
  - Test crosshair effect in LookOut AI showcase
  - Test on mobile device (touch, swipe gestures)
  - Test keyboard navigation throughout site
  - Verify no console errors
  - Verify existing features work (door, Red John, navigation)
  - Deploy to Vercel and test live site
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing sub-tasks and can be skipped for faster MVP
- Each property test references specific design document properties for traceability
- Use fast-check library for property-based testing with minimum 100 iterations
- All tests should be tagged with feature name and property number
- Gallery system is built incrementally: manifest → loader → renderer → lazy load → lightbox
- Crosshair effect is independent and implemented after gallery system is complete
- Checkpoint tasks ensure validation at key milestones
- Documentation and deployment tasks come after implementation is complete
