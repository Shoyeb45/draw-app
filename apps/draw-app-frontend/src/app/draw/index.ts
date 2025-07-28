// Updated draw.ts with infinite canvas functionality and two-finger touch panning
import { Shape } from "@/types/shapeType";
import React from "react";

// --- VIEWPORT STATE ---
// These variables define the current "window" into the infinite world.
// offsetX, offsetY: The world coordinates at the top-left corner of the canvas.
// scale: How much the world is zoomed. 1 = 1:1, >1 = zoomed in, <1 = zoomed out.
let offsetX = 0;
let offsetY = 0;
let scale = 1;

// --- MOUSE PAN STATE ---
// Tracks the state and starting conditions for mouse-based panning.
// let isPanning = false;         // Is a mouse pan currently active?
let panStartX = 0;             // Screen X where the pan started
let panStartY = 0;             // Screen Y where the pan started
let panStartOffsetX = 0;       // offsetX when the pan started
let panStartOffsetY = 0;       // offsetY when the pan started

// --- TOUCH PAN STATE ---
// Tracks the state and data for touch-based two-finger panning.
let isTouchPanning = false;    // Is a touch pan currently active?
let lastTouchCenter = { x: 0, y: 0 }; // The center point of the two touches in the previous frame
let isPanning = false;

/**
 * Initializes the drawing and infinite canvas functionalities.
 * Sets up event listeners and returns a cleanup function.
 */
export function initDraw(
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    shape: string
) {

    if (isPanning) {
        canvas.style.cursor = "grab";
    } else {
        canvas.style.cursor = "default";
    }
    // Initialize the basic drawing logic (mouse events for creating shapes)
    const cleanup = draw(canvas, shape, setShapes, shapes);

    // Initialize the infinite canvas logic (pan, zoom, coordinate conversion)
    const infiniteCleanup = makeCanvasInfinite(canvas, shapes, setShapes, shape);

    // Handle canvas resizing with the window
    window.addEventListener("resize", resizeCanvas);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw(canvas, shapes); // Redraw to fit the new size
    }

    // Return a function to clean up all event listeners when the component unmounts
    return () => {
        cleanup();
        infiniteCleanup();
        window.removeEventListener("resize", resizeCanvas);
    };
}

/**
 * Handles the core drawing logic for shapes (mouse down, move, up).
 * This function is separate from the infinite canvas logic.
 */
function draw(
    canvas: HTMLCanvasElement,
    shape: string,
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    shapes: Shape[]
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => { };

    redraw(canvas, shapes); // Initial draw

    let isDrawing = false; // Is the user currently drawing a new shape?
    let startX = 0, startY = 0; // World coordinates where the shape draw started

    const handleMouseDown = (e: MouseEvent) => {
        // Prevent drawing if the user is trying to pan
        if (isPanning || isTouchPanning) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        // Convert initial mouse screen position to world coordinates
        // This is crucial for placing shapes correctly in the infinite space.
        startX = screenToWorldX(e.clientX - rect.left);
        startY = screenToWorldY(e.clientY - rect.top);
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        // Convert final mouse screen position to world coordinates
        const endX = screenToWorldX(e.clientX - rect.left);
        const endY = screenToWorldY(e.clientY - rect.top);

        // Create the new shape using world coordinates and add it to the state
        if (shape === "rect") {
            const newShape: Shape = {
                type: "rect",
                // Store world coordinates
                x: Math.min(startX, endX),
                y: Math.min(startY, endY),
                width: Math.abs(endX - startX),
                height: Math.abs(endY - startY),
            };
            setShapes((prev: Shape[]) => [...prev, newShape]);
        } else if (shape === "ellipse") {
            const newShape: Shape = {
                type: "ellipse",
                // Store world coordinates
                x: startX + (endX - startX) / 2,
                y: startY + (endY - startY) / 2,
                radiusX: Math.abs(endX - startX) / 2,
                radiusY: Math.abs(endY - startY) / 2,
            };
            setShapes((prev: Shape[]) => [...prev, newShape]);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Only draw preview if actively drawing and not panning
        if (!isDrawing || isPanning || isTouchPanning) return;
        const rect = canvas.getBoundingClientRect();
        // Convert current mouse screen position to world coordinates
        const currentX = screenToWorldX(e.clientX - rect.left);
        const currentY = screenToWorldY(e.clientY - rect.top);

        redraw(canvas, shapes); // Clear canvas and redraw existing shapes/grid

        // Draw a temporary preview of the shape being created
        ctx.save();
        // Apply the current world-to-screen transformation so we can draw using world coordinates
        applyTransform(ctx);
        if (shape === "rect") {
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.strokeRect(startX, startY, width, height); // Draw using world coords
        } else if (shape === "ellipse") {
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.beginPath();
            // Draw using world coords
            ctx.ellipse(
                startX + width / 2,
                startY + height / 2,
                Math.abs(width) / 2,
                Math.abs(height) / 2,
                0,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }
        ctx.restore(); // Remove the transformation after drawing preview
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Cleanup drawing event listeners
    return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
    };
}

/**
 * Sets up all the event listeners and logic for the infinite canvas:
 * - Mouse and touch panning
 * - Mouse wheel and keyboard zooming
 * - Keyboard navigation
 * - Coordinate system conversion
 */
export function makeCanvasInfinite(
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
    shape: string
) {
    // --- PAN & ZOOM CONFIGURATION ---
    const PAN_SPEED = 20; // Speed of keyboard panning (pixels per animation frame)
    const keysPressed = new Set<string>(); // Tracks currently pressed keys for smooth panning
    let panAnimationId: number | null = null; // For requestAnimationFrame smooth keyboard panning
    let isDoubleTapped = false;
    // --- TOUCH HELPER ---
    /**
     * Calculates the center point of multiple touches relative to the canvas.
     * Used for two-finger panning.
     */
    const getTouchCenter = (touches: TouchList): { x: number, y: number } => {
        const rect = canvas.getBoundingClientRect();
        let x = 0, y = 0;
        for (let i = 0; i < touches.length; i++) {
            x += touches[i].clientX - rect.left; // Sum screen X offsets
            y += touches[i].clientY - rect.top;  // Sum screen Y offsets
        }
        // Return average (center)
        return { x: x / touches.length, y: y / touches.length };
    };



    // --- TOUCH EVENTS (Two-Finger Pan) ---
    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault(); // Prevent default touch actions like scrolling/zooming
        // Only start panning if exactly two fingers are touching

        if (e.touches.length === 2) {
            console.log("Two fingers detected, starting pan");
            isTouchPanning = true;
            const center = getTouchCenter(e.touches);
            lastTouchCenter = center; // Record starting center point
        }
    };


    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        // Only pan if two fingers are down and panning is active
        if (e.touches.length === 2 && isTouchPanning) {
            const center = getTouchCenter(e.touches);
            // Calculate how much the center point moved since last frame
            const deltaX = center.x - lastTouchCenter.x;
            const deltaY = center.y - lastTouchCenter.y;
            // Update the viewport offset.
            // Divide by scale to convert screen movement to world movement.
            // Subtract because moving fingers right should move the viewport left (showing more world on the left).
            offsetX -= deltaX / scale;
            offsetY -= deltaY / scale;

            lastTouchCenter = center; // Update for next frame
            redraw(canvas, shapes);   // Redraw with new viewport
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        // Stop panning if less than two fingers are touching
        if (e.touches.length < 2) {
            isTouchPanning = false;
        }
    };

    // --- WHEEL EVENT (Zoom) ---
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault(); // Prevent default page scrolling

        // --- DETECT PINCH ZOOM ---
        // Trackpads often send a non-zero deltaZ for pinch gestures.
        // Some trackpads (especially on Macs with newer browsers) might simulate this well.
        // Alternatively, check for ctrlKey being held (common browser behavior for pinch)
        // or look for significant deltaX/Y simultaneously (less reliable).
        const isPinchGesture = e.deltaZ !== 0 || e.ctrlKey; // Primary check: deltaZ or Ctrl

        if (isPinchGesture) {
            // --- ZOOM LOGIC (Pinch) ---
            const rect = canvas.getBoundingClientRect();

            // Determine the anchor point for zoom (typically the mouse position)
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // 1. Convert the screen coordinate of the mouse to a world coordinate
            //    BEFORE changing the scale. This is the point we want to stay under the cursor.
            const worldX = screenToWorldX(mouseX);
            const worldY = screenToWorldY(mouseY);

            // 2. Calculate the new scale based on wheel delta Y
            //    Use deltaY for zoom factor. Invert the sign if zooming feels backwards.
            //    You might need to adjust the sensitivity factor.
            const zoomSensitivity = 0.015; // Adjust this to control zoom speed
            const scaleFactor = Math.exp(-e.deltaY * zoomSensitivity); // Exponential scaling often feels better
            const newScale = Math.max(0.1, Math.min(5, scale * scaleFactor)); // Clamp scale

            // 3. Adjust the viewport offset so that the worldX, worldY point
            //    maps back to the same screenX, screenY position under the new scale.
            //    This keeps the zoom centered on the mouse cursor.
            offsetX = worldX - mouseX / newScale;
            offsetY = worldY - mouseY / newScale;
            scale = newScale; // Apply the new scale

            redraw(canvas, shapes); // Redraw with new scale and offset
            return; // Important: Exit if it was a zoom action
        }

        // --- PAN LOGIC (Scroll Wheel / Scroll Bars) ---
        // If it's not a pinch, treat it as panning.
        // Use deltaX and deltaY for panning. Shift + Wheel usually maps to deltaX.

        // Sensitivity factor for panning speed. Adjust as needed.
        const panSensitivity = 1.0;

        // Pan horizontally (e.g., Shift + Wheel) and vertically
        offsetX += (e.deltaX * panSensitivity) / scale;
        offsetY += (e.deltaY * panSensitivity) / scale;

        redraw(canvas, shapes);

    };

    // --- DOUBLE CLICK EVENT (Touchpad Double Tap) ---
    const handleDoubleClick = (e: MouseEvent) => {
        e.preventDefault(); // Prevent any default action if necessary
        console.log("Double clicked");
        isDoubleTapped = true;
        if (isPanning) {
            canvas.style.cursor = "grabbing";
            // redraw(canvas, shapes);
        }
    };
    // --- MOUSE EVENTS (Pan with Middle/Right/Space+Left Click) ---
    const handleMouseDown = (e: MouseEvent) => {
        // Check for middle mouse (1), right mouse (2), or spacebar + left mouse (0)
        if (e.button === 1 || e.button === 2 || (e.button === 0 && keysPressed.has(' '))) {
            e.preventDefault(); // Prevent context menu for right click
            // isPanning = true;
            isPanning = true;
            const rect = canvas.getBoundingClientRect();
            // Record the starting screen position of the mouse
            panStartX = e.clientX - rect.left;
            panStartY = e.clientY - rect.top;
            // Record the current viewport offset
            panStartOffsetX = offsetX;
            panStartOffsetY = offsetY;
            canvas.style.cursor = 'grabbing'; // Visual feedback
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        console.log(`panning: ${isPanning}, double Tapped: ${isDoubleTapped}`);
        
        if (isPanning) {
            canvas.style.cursor = "grabbing";
            const rect = canvas.getBoundingClientRect();
            // Get current screen position of the mouse
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            // Calculate the difference in screen coordinates from the start point
            const deltaScreenX = currentX - panStartX;
            const deltaScreenY = currentY - panStartY;

            // --- CRITICAL PAN LOGIC ---
            // Update the viewport offset.
            // Convert screen delta to world delta by dividing by scale.
            // Subtract because moving the mouse right should move the viewport left.
            offsetX = panStartOffsetX - deltaScreenX / scale;
            offsetY = panStartOffsetY - deltaScreenY / scale;

            redraw(canvas, shapes); // Redraw with new offset
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (isPanning) {
            isPanning = false;
            // Restore cursor based on whether spacebar is still held
            canvas.style.cursor = keysPressed.has(' ') ? 'grab' : 'default';
        }
    };

    // Prevent context menu on right click (used for panning)
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };


    // --- KEYBOARD PAN ANIMATION ---
    /**
     * Performs smooth panning based on currently pressed keys.
     * Uses requestAnimationFrame for performance.
     */
    const performKeyboardPan = () => {
        let panX = 0;
        let panY = 0;


        // Apply panning if any direction key is pressed
        if (panX !== 0 || panY !== 0) {
            // Convert pan speed from screen pixels to world units
            offsetX += panX / scale;
            offsetY += panY / scale;
            redraw(canvas, shapes); // Redraw with new offset
        }

        // Continue the animation loop if relevant keys are still pressed
        if (keysPressed.has('ArrowLeft') || keysPressed.has('ArrowRight') ||
            keysPressed.has('ArrowUp') || keysPressed.has('ArrowDown') ||
            keysPressed.has('w') || keysPressed.has('a') || keysPressed.has('s') || keysPressed.has('d') ||
            keysPressed.has('W') || keysPressed.has('A') || keysPressed.has('S') || keysPressed.has('D')) {
            panAnimationId = requestAnimationFrame(performKeyboardPan);
        } else {
            panAnimationId = null; // Stop if no keys are pressed
        }
    };

    // --- KEYBOARD SHORTCUTS ---
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent default for navigation keys to stop page scrolling
        // e.preventDefault();
        keysPressed.add(e.key); // Track key press

        // Spacebar activates temporary pan mode (changes cursor)
        if (e.key === ' ') {
            canvas.style.cursor = 'grab';
        }

        // Start keyboard panning animation if a movement key is pressed and it's not already running
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
            e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' ||
            e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D') && !panAnimationId) {
            panAnimationId = requestAnimationFrame(performKeyboardPan);
        }

        // Reset view to default (origin, 1:1 scale)
        if (e.altKey && (e.key === 'R' || e.key === 'r')) {
            offsetX = 0;
            offsetY = 0;
            scale = 1;
            redraw(canvas, shapes);
        }

        // Fit all drawn shapes to the view
        if (e.key === 'f' || e.key === 'F') {
            fitToContent(canvas, shapes);
        }

        // --- KEYBOARD ZOOM ---
        if (e.ctrlKey && (e.key === '+' || e.key == '=')) { // Zoom in
            e.preventDefault();
            // Use canvas center as the zoom anchor point
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            // Convert screen center to world coordinates before zooming
            const worldX = screenToWorldX(centerX);
            const worldY = screenToWorldY(centerY);
            const newScale = Math.min(5, scale * 1.2); // Apply zoom factor and clamp

            // Adjust offset to keep the world center under the screen center after zoom
            offsetX = worldX - centerX / newScale;
            offsetY = worldY - centerY / newScale;
            scale = newScale;
            redraw(canvas, shapes);
        }
        if (e.ctrlKey && (e.key === '-')) { // Zoom out
            e.preventDefault();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const worldX = screenToWorldX(centerX);
            const worldY = screenToWorldY(centerY);
            const newScale = Math.max(0.1, scale * 0.8); // Apply zoom factor and clamp

            offsetX = worldX - centerX / newScale;
            offsetY = worldY - centerY / newScale;
            scale = newScale;
            redraw(canvas, shapes);
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.delete(e.key); // Stop tracking key release
        if (e.key === ' ') {
            // Restore cursor when spacebar is released
            canvas.style.cursor = 'default';
        }
    };

    // --- ATTACH EVENT LISTENERS ---
    canvas.addEventListener("wheel", handleWheel, { passive: false }); // Passive false needed for preventDefault
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", handleContextMenu);

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    canvas.addEventListener("dblclick", handleDoubleClick);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.tabIndex = 0; // Make canvas focusable to receive keyboard events
    canvas.focus();      // Focus it initially

    // --- CLEANUP FUNCTION ---
    return () => {
        // Remove all event listeners
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("contextmenu", handleContextMenu);

        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("dblclick", handleDoubleClick);
        canvas.removeEventListener("touchcancel", handleTouchEnd);

        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);

        // Cancel any ongoing keyboard panning animation
        if (panAnimationId) {
            cancelAnimationFrame(panAnimationId);
        }
    };
}

// --- COORDINATE CONVERSION FUNCTIONS ---
/**
 * Converts an X coordinate from screen space to world space.
 * Screen space: pixels on the canvas element.
 * World space: the infinite coordinate system where shapes are stored.
 * Formula: (ScreenX / Scale) + OffsetX
 * Example: Screen pixel 400, scale 2, offset 100 -> World coord (400/2) + 100 = 300
 */
function screenToWorldX(screenX: number): number {
    return screenX / scale + offsetX;
}

/**
 * Converts a Y coordinate from screen space to world space.
 * Formula: (ScreenY / Scale) + OffsetY
 */
function screenToWorldY(screenY: number): number {
    return screenY / scale + offsetY;
}

/**
 * Converts an X coordinate from world space to screen space.
 * Formula: (WorldX - OffsetX) * Scale
 * Example: World coord 300, offset 100, scale 2 -> Screen pixel (300-100) * 2 = 400
 */
function worldToScreenX(worldX: number): number {
    return (worldX - offsetX) * scale;
}

/**
 * Converts a Y coordinate from world space to screen space.
 * Formula: (WorldY - OffsetY) * Scale
 */
function worldToScreenY(worldY: number): number {
    return (worldY - offsetY) * scale;
}

// --- TRANSFORMATION & RENDERING ---
/**
 * Applies the current viewport transformation (scale and translate) to the canvas context.
 * This allows drawing commands to use world coordinates directly, and they will appear
 * correctly on the screen based on the current view (offset and scale).
 * Order matters: scale first, then translate.
 */
function applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.scale(scale, scale);           // Apply zoom
    ctx.translate(-offsetX, -offsetY); // Apply panning (move world origin)
}

/**
 * Clears the canvas and redraws the entire scene: grid and all shapes.
 * This is called whenever the view (pan/zoom) changes or a new shape is added.
 */
function redraw(canvas: HTMLCanvasElement, shapes: Shape[]) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with a black background
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Save the default context state
    applyTransform(ctx); // Apply the world-to-screen transformation

    // Draw the grid (using world coordinates, transformed by applyTransform)
    drawGrid(ctx, canvas);

    // Draw all shapes (using their stored world coordinates, transformed)
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    // Adjust line width so it appears consistent regardless of zoom level
    ctx.lineWidth = 1 / scale;
    shapes.forEach(shape => {
        if (shape.type === "rect") {
            // Draw using world coordinates (applyTransform handles screen mapping)
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "ellipse") {
            ctx.beginPath();
            // Draw using world coordinates
            ctx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });

    ctx.restore(); // Restore default context state (removes transformation)
}

// --- GRID ---
/**
 * Draws a subtle grid on the canvas to provide spatial reference.
 * The grid is drawn dynamically based on the current viewport (offset/scale).
 */
function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const gridSize = 50; // Base size of grid squares in world units

    // Calculate the range of grid lines to draw based on the current viewport
    // Start drawing slightly before the visible area for seamless appearance
    const startX = Math.floor(offsetX / gridSize) * gridSize;
    const startY = Math.floor(offsetY / gridSize) * gridSize;
    // End drawing slightly after the visible area
    const endX = offsetX + canvas.width / scale;
    const endY = offsetY + canvas.height / scale;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Light gray, semi-transparent
    // Adjust grid line width to be consistent
    ctx.lineWidth = 1 / scale;
    ctx.beginPath();

    // Draw vertical grid lines
    for (let x = startX; x <= endX; x += gridSize) {
        // Draw line from top of viewport to bottom of viewport
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + canvas.height / scale);
    }

    // Draw horizontal grid lines
    for (let y = startY; y <= endY; y += gridSize) {
        // Draw line from left of viewport to right of viewport
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + canvas.width / scale, y);
    }
    ctx.stroke();
}

// --- VIEW UTILITY ---
/**
 * Adjusts the viewport (offset and scale) to fit all drawn shapes within the canvas view.
 */
function fitToContent(canvas: HTMLCanvasElement, shapes: Shape[]) {
    if (shapes.length === 0) {
        // If no shapes, reset to default view
        offsetX = 0;
        offsetY = 0;
        scale = 1;
        return;
    }

    // Find the bounding box that encompasses all shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach(shape => {
        if (shape.type === "rect") {
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
            maxX = Math.max(maxX, shape.x + shape.width);
            maxY = Math.max(maxY, shape.y + shape.height);
        } else if (shape.type === "ellipse") {
            minX = Math.min(minX, shape.x - shape.radiusX);
            minY = Math.min(minY, shape.y - shape.radiusY);
            maxX = Math.max(maxX, shape.x + shape.radiusX);
            maxY = Math.max(maxY, shape.y + shape.radiusY);
        }
    });

    // Add some padding around the content
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate the width and height of the content area
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate the scale needed to fit the content width and height
    const scaleX = canvas.width / contentWidth;
    const scaleY = canvas.height / contentHeight;

    // Use the smaller scale to ensure both dimensions fit, but don't zoom in past 100%
    scale = Math.min(scaleX, scaleY, 1);

    // Calculate new offsets to center the content
    // (Viewport offset is the world coordinate at the top-left of the screen)
    offsetX = minX - (canvas.width / scale - contentWidth) / 2;
    offsetY = minY - (canvas.height / scale - contentHeight) / 2;

    redraw(canvas, shapes); // Redraw with the new view
}