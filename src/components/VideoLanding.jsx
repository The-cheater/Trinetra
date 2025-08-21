import { useEffect, useRef } from 'react';

const VideoLanding = ({ onVideoComplete }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      onVideoComplete();
    };

    videoElement.addEventListener('ended', handleEnded);

    // Attempt autoplay when metadata is ready (needed on some browsers)
    const tryPlay = () => {
      const playPromise = videoElement.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // If autoplay fails, keep muted and try again on a microtask
          setTimeout(() => videoElement.play().catch(() => {}), 0);
        });
      }
    };

    if (videoElement.readyState >= 2) {
      tryPlay();
    } else {
      const onLoaded = () => tryPlay();
      videoElement.addEventListener('loadeddata', onLoaded);
      return () => {
        videoElement.removeEventListener('loadeddata', onLoaded);
        videoElement.removeEventListener('ended', handleEnded);
      };
    }

    return () => {
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onVideoComplete]);

  return (
    <div className="video-landing">
      <div className="video-container" style={{ width: '100%', height: '100vh' }}>
        <video
          ref={videoRef}
          className="landing-video"
          src="/videos/lv_0_20250814213236.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          controls={false}
          onEnded={onVideoComplete}
        />
      </div>
    </div>
  );
};

export default VideoLanding;
