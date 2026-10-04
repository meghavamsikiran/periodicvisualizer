import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { HandTrackingEngine } from '../utils/HandTrackingEngine';
import { soundFx } from '../utils/AudioController';

export default function CameraAROverlay({ isCameraOn, facingMode = 'user', isInvertHandX = false, isInvertHandY = false, onHandPinchMove, onHandPinchStart, onHandPinchEnd }) {
  const videoRef = useRef(null);
  const [streamError, setStreamError] = useState(null);
  const [handCursor, setHandCursor] = useState(null); // { screenX, screenY, isPinching }
  const handEngineRef = useRef(null);

  useEffect(() => {
    let currentStream = null;

    if (isCameraOn) {
      const getMedia = async () => {
        try {
          // Stop any previous active hand tracking or camera stream tracks
          if (handEngineRef.current) {
            handEngineRef.current.stop();
            handEngineRef.current = null;
          }

          if (videoRef.current && videoRef.current.srcObject) {
            const activeTracks = videoRef.current.srcObject.getTracks();
            activeTracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
          }

          let stream;
          const isBackCamera = facingMode === 'environment';

          if (isBackCamera) {
            try {
              // Try exact environment constraint for multi-lens mobile devices
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: { exact: 'environment' },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              });
            } catch (e1) {
              try {
                // Try ideal environment constraint
                stream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }
                });
              } catch (e2) {
                try {
                  stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                  });
                } catch (e3) {
                  stream = await navigator.mediaDevices.getUserMedia({ video: true });
                }
              }
            }
          } else {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              });
            } catch (e1) {
              stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
          }

          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
          setStreamError(null);

          // Initialize Hand Tracking Engine with camera direction & inversion options
          const engine = new HandTrackingEngine(
            (pos) => {
              if (pos.hasHand === false || pos.isActive === false) {
                setHandCursor(null);
              } else {
                setHandCursor({
                  screenX: pos.screenX,
                  screenY: pos.screenY,
                  isPinching: pos.isPinching,
                  hasHand: true
                });
              }
              if (onHandPinchMove) onHandPinchMove(pos);
            },
            (pos) => {
              soundFx.playClick();
              setHandCursor({
                screenX: pos.screenX,
                screenY: pos.screenY,
                isPinching: true,
                hasHand: true
              });
              if (onHandPinchStart) onHandPinchStart(pos);
            },
            (pos) => {
              if (pos.hasHand === false) {
                setHandCursor(null);
              } else {
                setHandCursor((prev) => (prev ? { ...prev, isPinching: false, hasHand: true } : null));
              }
              if (onHandPinchEnd) onHandPinchEnd(pos);
            },
            {
              isBackCamera: facingMode === 'environment',
              invertX: isInvertHandX,
              invertY: isInvertHandY
            }
          );

          engine.start(videoRef.current);
          handEngineRef.current = engine;
        } catch (err) {
          console.warn('Camera access prevented or unavailable:', err);
          setStreamError('Camera permission required for Room AR & Hand Tracking.');
        }
      };

      getMedia();
    } else {
      if (handEngineRef.current) {
        handEngineRef.current.stop();
        handEngineRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setHandCursor(null);
    }

    return () => {
      if (handEngineRef.current) {
        handEngineRef.current.stop();
      }
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn, facingMode]);

  // Update hand tracking direction dynamically without interrupting active video stream!
  useEffect(() => {
    if (handEngineRef.current) {
      handEngineRef.current.setBackCamera(facingMode === 'environment');
      handEngineRef.current.setInvertX(isInvertHandX);
      handEngineRef.current.setInvertY(isInvertHandY);
    }
  }, [facingMode, isInvertHandX, isInvertHandY]);


  const isBack = facingMode === 'environment';

  return (
    <>
      {/* Background Live Camera Feed */}
      {isCameraOn && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover opacity-80 scale-105 filter brightness-110 contrast-105 transition-transform ${
              isBack ? 'scale-x-100' : '-scale-x-100'
            }`}
          />
          {/* Cyberpunk AR HUD Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* Spatial Hand Cursor Ring Overlay - ONLY rendered when a hand is physically detected! */}
      {isCameraOn && handCursor && handCursor.hasHand && handCursor.screenX !== undefined && (
        <div
          style={{
            left: `${handCursor.screenX * 100}%`,
            top: `${handCursor.screenY * 100}%`
          }}
          className={`fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
            handCursor.isPinching ? 'scale-125' : 'scale-100'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full border-2 border-dashed animate-spin-slow flex items-center justify-center shadow-2xl transition-all ${
              handCursor.isPinching
                ? 'border-emerald-400 bg-emerald-500/35 shadow-[0_0_30px_#10b981]'
                : 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_#00f0ff]'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full shadow-[0_0_10px_#ffffff] transition-all ${
                handCursor.isPinching ? 'bg-emerald-300 scale-125' : 'bg-white'
              }`}
            />
          </div>
          <span
            className={`absolute top-16 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold px-3 py-1 rounded-full border whitespace-nowrap backdrop-blur-md transition-all ${
              handCursor.isPinching
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-950/85 text-cyan-300 border-cyan-400/50'
            }`}
          >
            {handCursor.isPinching ? '👌 Pinch Active • Controlling Molecule' : '🖐️ Hand Tracking Active'}
          </span>
        </div>
      )}

      {/* Stream Error Toast */}
      {streamError && isCameraOn && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs backdrop-blur-md flex items-center gap-2">
          <Camera className="w-4 h-4 text-red-400" />
          <span>{streamError}</span>
        </div>
      )}
    </>
  );
}
