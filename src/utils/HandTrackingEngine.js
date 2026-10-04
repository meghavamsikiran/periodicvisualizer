// WebCam Hand Tracking & Gesture Detection Engine (MediaPipe Hands / Multi-Hand Dual Pinch & Zoom Engine)

export class HandTrackingEngine {
  constructor(onHandMove, onPinchStart, onPinchEnd, options = {}) {
    this.onHandMove = onHandMove;
    this.onPinchStart = onPinchStart;
    this.onPinchEnd = onPinchEnd;
    this.isBackCamera = options.isBackCamera || false;
    this.invertX = options.invertX || false;
    this.invertY = options.invertY || false;
    this.isTracking = false;
    this.isPinching = false;
    this.videoElement = null;
    this.handsDetector = null;
    this.cameraInstance = null;

    // Smooth position state for jitter-free tracking
    this.smoothX = 0;
    this.smoothY = 0;
    this.smoothScreenX = 0.5;
    this.smoothScreenY = 0.5;
    this.smoothTwoHandDistance = 0.4;
    this.lostFramesCount = 0;
    this.maxMemoryFrames = 15; // Maintain soft tracking memory for 15 frames at camera borders

    // Pinch Hysteresis Thresholds (Index Tip to Thumb Tip normalized distance)
    this.pinchStartThreshold = 0.085;
    this.pinchEndThreshold = 0.115;
  }

  setInvertX(invertX) {
    this.invertX = invertX;
  }

  setInvertY(invertY) {
    this.invertY = invertY;
  }

  setBackCamera(isBackCamera) {
    this.isBackCamera = isBackCamera;
  }

  async start(videoElement) {
    this.videoElement = videoElement;
    this.isTracking = true;

    try {
      // Load MediaPipe Hands script dynamically if not present
      if (typeof window !== 'undefined' && !window.Hands) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      }

      if (window.Hands && this.videoElement) {
        this.handsDetector = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.handsDetector.setOptions({
          maxNumHands: 2, // Dual Hand Tracking for Pinch-Zoom
          modelComplexity: 1,
          minDetectionConfidence: 0.25, // High sensitivity for border & corner tracking
          minTrackingConfidence: 0.25
        });

        this.handsDetector.onResults(this.handleHandResults.bind(this));

        if (window.Camera) {
          this.cameraInstance = new window.Camera(this.videoElement, {
            onFrame: async () => {
              if (this.isTracking && this.handsDetector && this.videoElement && this.videoElement.readyState >= 2) {
                try {
                  await this.handsDetector.send({ image: this.videoElement });
                } catch (err) {
                  // Catch frame processing glitches silently
                }
              }
            },
            width: 1280,
            height: 720
          });
          this.cameraInstance.start();
        }
      }
    } catch (err) {
      console.warn('Hand tracking initialization error:', err);
    }
  }

  handleHandResults(results) {
    if (!this.isTracking) return;

    try {
      const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

      if (hasHands) {
        this.lostFramesCount = 0; // Reset lost frame counter
        const primaryHand = results.multiHandLandmarks[0];

        // Primary Hand: Index Finger Tip (8), Thumb Tip (4), and Middle MCP (9) for edge stability
        const indexTip = primaryHand[8];
        const thumbTip = primaryHand[4];
        const middleMcp = primaryHand[9];
        const wrist = primaryHand[0];

        // Corner & Edge Detection: If fingertips are near frame boundary, blend with middle MCP & wrist
        const isNearEdge = indexTip.x < 0.12 || indexTip.x > 0.88 || indexTip.y < 0.12 || indexTip.y > 0.88;

        const rawPinchX = isNearEdge
          ? (indexTip.x * 0.35 + thumbTip.x * 0.35 + middleMcp.x * 0.3)
          : (indexTip.x + thumbTip.x) / 2;

        const rawPinchY = isNearEdge
          ? (indexTip.y * 0.35 + thumbTip.y * 0.35 + middleMcp.y * 0.3)
          : (indexTip.y + thumbTip.y) / 2;

        // Determine raw screen coordinates (0..1)
        let screenX = this.isBackCamera ? rawPinchX : (1.0 - rawPinchX);
        if (this.invertX) screenX = 1.0 - screenX;

        let screenY = rawPinchY;
        if (this.invertY) screenY = 1.0 - screenY;

        // --- ASPECT RATIO CORRECTION FOR CSS 'object-cover' ---
        // Laptop webcams often stream in 4:3 (1.33) or 16:9 (1.77) while monitor screens are 16:9, 16:10, or mobile portrait (9:16).
        // object-cover crops excess video overflow. We adjust screenX & screenY to map 1:1 to visible screen space!
        let videoAspect = 1.777;
        if (this.videoElement && this.videoElement.videoWidth && this.videoElement.videoHeight && this.videoElement.videoHeight > 0) {
          videoAspect = this.videoElement.videoWidth / this.videoElement.videoHeight;
        }

        const windowWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1280;
        const windowHeight = (typeof window !== 'undefined' && window.innerHeight) ? Math.max(window.innerHeight, 1) : 720;
        const screenAspect = windowWidth / windowHeight;

        let correctedScreenX = screenX;
        let correctedScreenY = screenY;

        if (videoAspect > screenAspect) {
          // Video is wider than screen (cropped horizontally on left/right edges)
          const cropX = (1.0 - (screenAspect / videoAspect)) / 2.0;
          correctedScreenX = (screenX - cropX) / (1.0 - 2.0 * cropX);
        } else if (videoAspect < screenAspect) {
          // Video is taller than screen (cropped vertically on top/bottom edges)
          const cropY = (1.0 - (videoAspect / screenAspect)) / 2.0;
          correctedScreenY = (screenY - cropY) / (1.0 - 2.0 * cropY);
        }

        correctedScreenX = Math.max(0.0, Math.min(1.0, correctedScreenX));
        correctedScreenY = Math.max(0.0, Math.min(1.0, correctedScreenY));

        // Edge Remapping with Elastic Margin (5% margin allows easy reach to full screen perimeter)
        const edgeMargin = 0.05;
        const mappedScreenX = Math.max(0.0, Math.min(1.0, (correctedScreenX - edgeMargin) / (1.0 - 2 * edgeMargin)));
        const mappedScreenY = Math.max(0.0, Math.min(1.0, (correctedScreenY - edgeMargin) / (1.0 - 2 * edgeMargin)));

        // Single Hand Palm Depth Size (Wrist Landmark 0 to Middle Finger Base Landmark 9)
        const pdx = middleMcp.x - wrist.x;
        const pdy = middleMcp.y - wrist.y;
        const palmSize = Math.sqrt(pdx * pdx + pdy * pdy) || 0.15;

        // Single Hand Pinch Distance (Thumb & Index)
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dz = (indexTip.z || 0) - (thumbTip.z || 0);
        const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Distance-Invariant Normalized Pinch Ratio (relative to palm size)
        const normalizedPinchRatio = pinchDistance / palmSize;

        // Dynamic Aspect-Ratio Responsive 3D Coordinate Mapping
        // Three.js frustum at z=0 with FOV 48 at distance 5.5 spans approx 4.2 vertically & 4.2*aspect horizontally
        const spanX = Math.max(3.6, screenAspect * 3.8);
        const spanY = Math.max(2.6, 3.8);

        const targetRawX = Math.max(-spanX / 2, Math.min(spanX / 2, (mappedScreenX - 0.5) * spanX));
        const targetRawY = Math.max(-spanY / 2, Math.min(spanY / 2, -(mappedScreenY - 0.5) * spanY));

        // Refined Dual-Stage Low-Pass Smoothing Filter:
        // On high-res laptop displays, jitter is magnified. We use low alpha (0.14) for slow movements (rock-solid stability)
        // and scale up smoothly to 0.65 for fast movement (zero lag).
        const distMoved = Math.hypot(targetRawX - this.smoothX, targetRawY - this.smoothY);
        const alpha = Math.min(0.65, Math.max(0.14, distMoved * 0.85));

        this.smoothX += (targetRawX - this.smoothX) * alpha;
        this.smoothY += (targetRawY - this.smoothY) * alpha;
        this.smoothScreenX += (mappedScreenX - this.smoothScreenX) * alpha;
        this.smoothScreenY += (mappedScreenY - this.smoothScreenY) * alpha;

        // Dual Hand Zoom Check (If 2 hands are detected in camera view)
        let twoHandDistance = null;
        let isTwoHanded = false;

        if (results.multiHandLandmarks.length === 2) {
          isTwoHanded = true;
          const secondHand = results.multiHandLandmarks[1];
          const h2Index = secondHand[8];

          const h1ScreenX = 1.0 - indexTip.x;
          const h2ScreenX = 1.0 - h2Index.x;

          const hdx = h1ScreenX - h2ScreenX;
          const hdy = indexTip.y - h2Index.y;
          const rawTwoHandDist = Math.sqrt(hdx * hdx + hdy * hdy);

          this.smoothTwoHandDistance += (rawTwoHandDist - this.smoothTwoHandDistance) * 0.3;
          twoHandDistance = this.smoothTwoHandDistance;
        }

        // Distance-Invariant Pinch State Machine (Pinch Ratio Thresholds: start < 0.42, end > 0.60)
        const pinchStartRatio = 0.42;
        const pinchEndRatio = 0.60;

        if (!this.isPinching && normalizedPinchRatio < pinchStartRatio) {
          this.isPinching = true;
          if (this.onPinchStart) {
            this.onPinchStart({
              x: this.smoothX,
              y: this.smoothY,
              screenX: this.smoothScreenX,
              screenY: this.smoothScreenY,
              isPinching: true,
              pinchDistance,
              palmSize,
              normalizedPinchRatio,
              isTwoHanded,
              twoHandDistance
            });
          }
        } else if (this.isPinching && normalizedPinchRatio > pinchEndRatio) {
          this.isPinching = false;
          if (this.onPinchEnd) {
            this.onPinchEnd({
              x: this.smoothX,
              y: this.smoothY,
              screenX: this.smoothScreenX,
              screenY: this.smoothScreenY,
              isPinching: false,
              pinchDistance,
              palmSize,
              normalizedPinchRatio,
              isTwoHanded,
              twoHandDistance
            });
          }
        }

        // Trigger continuous hand position update
        if (this.onHandMove) {
          this.onHandMove({
            x: this.smoothX,
            y: this.smoothY,
            screenX: this.smoothScreenX,
            screenY: this.smoothScreenY,
            isPinching: this.isPinching,
            pinchDistance,
            palmSize,
            normalizedPinchRatio,
            isTwoHanded,
            twoHandDistance,
            handCount: results.multiHandLandmarks.length,
            hasHand: true,
            isActive: true
          });
        }
      } else {
        // Soft Edge Memory: Extend tracking memory at camera borders up to 12 frames to prevent corner dropouts
        const edgeMemoryLimit = (this.smoothScreenX < 0.15 || this.smoothScreenX > 0.85 || this.smoothScreenY < 0.15 || this.smoothScreenY > 0.85) ? 12 : 5;

        if (this.lostFramesCount < edgeMemoryLimit) {
          this.lostFramesCount++;
          if (this.onHandMove) {
            this.onHandMove({
              x: this.smoothX,
              y: this.smoothY,
              screenX: this.smoothScreenX,
              screenY: this.smoothScreenY,
              isPinching: this.isPinching,
              handCount: 0,
              hasHand: true,
              isActive: true
            });
          }
        } else {
          // Hands lost! Immediately notify subscribers that no hands are present
          if (this.isPinching) {
            this.isPinching = false;
            if (this.onPinchEnd) {
              this.onPinchEnd({
                x: this.smoothX,
                y: this.smoothY,
                screenX: this.smoothScreenX,
                screenY: this.smoothScreenY,
                isPinching: false,
                handCount: 0,
                hasHand: false,
                isActive: false
              });
            }
          }
          if (this.onHandMove) {
            this.onHandMove({
              x: this.smoothX,
              y: this.smoothY,
              screenX: this.smoothScreenX,
              screenY: this.smoothScreenY,
              isPinching: false,
              handCount: 0,
              hasHand: false,
              isActive: false
            });
          }
        }
      }
    } catch (err) {
      // Safe error handling for frame processing
    }
  }

  stop() {
    this.isTracking = false;
    this.isPinching = false;
    if (this.cameraInstance) {
      try { this.cameraInstance.stop(); } catch (e) {}
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }
}
