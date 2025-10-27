import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import OverlayCanvas from './OverlayCanvas';
import OverlayControls from './OverlayControls';
import Notification from './Notification';
import SpeakerIcon from './icons/SpeakerIcon';
import { overlayAPI } from '../services/api';

function VideoPlayer() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rtspUrl, setRtspUrl] = useState('');
  const [streamName, setStreamName] = useState('test');
  const [streamStatus, setStreamStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [overlays, setOverlays] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const MEDIAMTX_HLS_BASE = 'http://localhost:8888';
  const STREAM_ID = 'default';

  useEffect(() => {
    loadOverlaysFromDB();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const loadOverlaysFromDB = async () => {
    setIsLoading(true);
    const result = await overlayAPI.getOverlays(STREAM_ID);
    
    if (result.success) {
      const loadedOverlays = result.data.overlays.map(overlay => ({
        id: overlay._id,
        type: overlay.type,
        content: overlay.content,
        position: overlay.position,
        size: overlay.size,
        style: overlay.style
      }));
      setOverlays(loadedOverlays);
      if (loadedOverlays.length > 0) {
        showNotification(`Loaded ${loadedOverlays.length} overlay(s)`, 'success');
      }
    } else {
      console.error('Failed to load overlays:', result.error);
    }
    setIsLoading(false);
  };

  const saveOverlaysToDB = async () => {
    setIsSaving(true);
    
    try {
      await overlayAPI.deleteStreamOverlays(STREAM_ID);
      
      let successCount = 0;
      for (const overlay of overlays) {
        const overlayData = {
          type: overlay.type,
          content: overlay.content,
          position: overlay.position,
          size: overlay.size,
          style: overlay.style,
          streamId: STREAM_ID
        };
        
        const result = await overlayAPI.createOverlay(overlayData);
        if (result.success) {
          successCount++;
        }
      }
      
      showNotification(`Saved ${successCount} overlay(s) successfully!`, 'success');
      await loadOverlaysFromDB();
    } catch (error) {
      showNotification('Failed to save overlays', 'error');
    }
    
    setIsSaving(false);
  };

  const clearAllOverlays = async () => {
    if (window.confirm('Are you sure you want to delete all overlays?')) {
      const result = await overlayAPI.deleteStreamOverlays(STREAM_ID);
      if (result.success) {
        setOverlays([]);
        showNotification('All overlays deleted', 'success');
      } else {
        showNotification('Failed to delete overlays', 'error');
      }
    }
  };

  const loadStream = (videoSourceUrl) => {
    const video = videoRef.current;
    
    // Destroy existing HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setStreamStatus('connecting');
    setErrorMessage('');
    setRecordedBlob(null); // Clear any previous recorded video

    // Check if it's a direct video file (MP4, WebM, or a blob URL)
    const isDirectVideo = videoSourceUrl.startsWith('blob:') || 
                          videoSourceUrl.endsWith('.mp4') || 
                          videoSourceUrl.endsWith('.webm') ||
                          videoSourceUrl.endsWith('.ogg');

    if (isDirectVideo) {
      // Handle direct video files (MP4, WebM, etc.)
      video.src = videoSourceUrl;
      video.load(); // Load the new source
      
      video.oncanplay = () => {
        setStreamStatus('ready');
        console.log('Direct video loaded successfully');
        // Don't auto-play, wait for user to click play button
      };
      
      video.onerror = () => {
        setStreamStatus('error');
        setErrorMessage('Failed to load direct video');
      };
      
    } else if (Hls.isSupported()) {
      // Handle HLS streams
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(videoSourceUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamStatus('ready');
        console.log('HLS stream loaded successfully');
        // Don't auto-play, wait for user to click play button
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          setStreamStatus('error');
          setErrorMessage(`Stream error: ${data.type}`);
        }
      });
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for native HLS support (Safari)
      video.src = videoSourceUrl;
      video.load();
      
      video.oncanplay = () => {
        setStreamStatus('ready');
        console.log('Native HLS stream loaded successfully');
        // Don't auto-play, wait for user to click play button
      };
      
      video.onerror = () => {
        setStreamStatus('error');
        setErrorMessage('Failed to load native HLS video');
      };
    } else {
      setStreamStatus('error');
      setErrorMessage('HLS not supported in this browser');
    }
  };

  const handleLoadStream = () => {
    if (!streamName.trim()) {
      setErrorMessage('Please enter a stream name');
      return;
    }
    
    const hlsUrl = `${MEDIAMTX_HLS_BASE}/${streamName}/index.m3u8`;
    loadStream(hlsUrl);
  };

  const handleLoadTestStream = () => {
    setStreamName('test');
    // Use a working test stream instead of MediaMTX for now
    const hlsUrl = 'https://demo.unified-streaming.com/k8s/rise-of-vertical-video/stable/source/content.ism/.m3u8';
    loadStream(hlsUrl);
  };

  const handleLoadCustomVideo = () => {
    if (!customVideoUrl.trim()) {
      showNotification('Please enter a video URL', 'error');
      return;
    }
    setStreamName('custom');
    loadStream(customVideoUrl);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);
      setStreamName('uploaded');
      loadStream(videoUrl);
      showNotification('Video uploaded successfully!', 'success');
    } else {
      showNotification('Please select a valid video file', 'error');
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setStreamStatus('playing');
      }).catch(err => {
        console.error('Play error:', err);
        setErrorMessage('Failed to play video');
      });
    } else {
      video.pause();
      setIsPlaying(false);
      setStreamStatus('paused');
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const getStatusColor = () => {
    switch (streamStatus) {
      case 'connecting': return '#ffc107';
      case 'ready': return '#28a745';
      case 'playing': return '#28a745';
      case 'paused': return '#6c757d';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const startRecording = async () => {
    try {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) {
        showNotification('Please load a video first', 'error');
        return;
      }

      // Create canvas to capture video + overlays
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Set up MediaRecorder
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Try different MP4 codecs in order of preference
      let mimeType = 'video/mp4;codecs=h264';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp9';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedChunks([]);
        showNotification('Recording completed! Click download to save.', 'success');
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);

      // Start drawing loop
      let animationId;
      const drawFrame = () => {
        if (!isRecording) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw overlays
        overlays.forEach(overlay => {
          const x = overlay.position.x * canvas.width;
          const y = overlay.position.y * canvas.height;
          const width = overlay.size.width * canvas.width;
          const height = overlay.size.height * canvas.height;

          if (overlay.type === 'text') {
            ctx.fillStyle = overlay.style.color || '#ffffff';
            ctx.font = `${overlay.style.fontSize || 24}px Arial`;
            ctx.fillText(overlay.content, x, y + (overlay.style.fontSize || 24));
          } else if (overlay.type === 'image') {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.drawImage(img, x, y, width, height);
            };
            img.src = overlay.content;
          }
        });

        animationId = requestAnimationFrame(drawFrame);
      };

      drawFrame();
      
      // Store animation ID for cleanup
      setMediaRecorder(recorder);
      showNotification('Recording started!', 'success');

    } catch (error) {
      console.error('Recording error:', error);
      showNotification('Failed to start recording', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
      showNotification('Recording stopped', 'info');
    }
  };

  const downloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Determine file extension based on MIME type
      let extension = 'webm';
      if (recordedBlob.type.includes('mp4')) {
        extension = 'mp4';
      } else if (recordedBlob.type.includes('webm')) {
        extension = 'webm';
      }
      
      a.download = `edited-video-${new Date().getTime()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`Video downloaded as ${extension.toUpperCase()}!`, 'success');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Left Panel - Controls */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-700/50 h-fit max-h-[85vh] overflow-y-auto text-gray-200">
        <div className="mb-4">
        <div className="flex gap-2 items-center flex-wrap mb-3">
          <label htmlFor="streamName" className="font-semibold text-gray-300">Stream Name:</label>
          <input
            id="streamName"
            type="text"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
              placeholder="livestream"
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleLoadStream} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Load Stream
          </button>
          <button onClick={handleLoadTestStream} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Demo Video
          </button>
        </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-800/40 shadow-lg">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">🎬 Custom Video Options</h4>
          
          <div className="mb-4">
            <label htmlFor="customVideoUrl" className="block font-medium text-gray-300 mb-2">Video URL (MP4, WebM, HLS):</label>
            <input
              id="customVideoUrl"
              type="url"
              value={customVideoUrl}
              onChange={(e) => setCustomVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button onClick={handleLoadCustomVideo} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Load Custom Video
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="videoUpload" className="font-medium text-gray-300 cursor-pointer p-3 border-2 border-dashed border-blue-700 rounded-md text-center hover:bg-blue-900/30 hover:border-blue-600 transition-colors">
              📁 Upload Video File:
            </label>
            <input
              id="videoUpload"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedVideo && (
              <div className="flex items-center gap-4 p-3 bg-green-100 border border-green-300 rounded-md text-green-800">
                <span>✅ Video loaded from file</span>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(uploadedVideo);
                    setUploadedVideo(null);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        

        {streamStatus !== 'idle' && (
          <div className="mt-4 p-3 border-l-4 rounded-r-md" style={{ borderColor: getStatusColor(), backgroundColor: `${getStatusColor()}20` }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor() }}></span>
              <span className="text-sm font-medium">
                Status: <strong>{streamStatus}</strong>
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
            ⚠️ {errorMessage}
          </div>
        )}
        
        <OverlayControls onAddOverlay={(overlay) => setOverlays([...overlays, overlay])} />
        
        <div className="mt-4 flex gap-2 flex-wrap">
          <button 
            onClick={saveOverlaysToDB} 
            className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            disabled={isSaving || overlays.length === 0}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Overlays'}
          </button>
          <button 
            onClick={loadOverlaysFromDB} 
            className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Loading...' : '📥 Load Overlays'}
          </button>
          <button 
            onClick={clearAllOverlays} 
            className="flex-1 min-w-[120px] px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            disabled={overlays.length === 0}
          >
            🗑️ Clear All
          </button>
        </div>

        {overlays.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Active Overlays ({overlays.length})</h4>
            <div className="flex flex-col gap-2">
              {overlays.map(overlay => (
                <div key={overlay.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">{overlay.type}</span>
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {overlay.type === 'text' ? overlay.content : '🖼️ Image'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Right Panel - Video Player */}
          <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-800/50 flex flex-col">
        <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-visible shadow-2xl mb-4">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls={false}
          />
          <OverlayCanvas
            overlays={overlays}
            onOverlaysChange={setOverlays}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg">
        <button 
          onClick={handlePlayPause} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          disabled={streamStatus === 'idle' || streamStatus === 'error'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-black font-bold">
              <SpeakerIcon className="inline-block" fill="currentColor" />
            </label>
            <span className="text-xs text-gray-800 font-semibold sm:hidden">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
            }}
          />
          <span className="text-xs text-gray-800 font-semibold min-w-[25px] text-right hidden sm:block">{Math.round(volume * 100)}%</span>
        </div>
        </div>

        {/* Recording Controls */}
        <div className="mt-4 p-4 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg border border-red-800/40 shadow-lg">
          <h4 className="text-lg font-semibold text-rose-300 mb-3">🎬 Video Recording</h4>
          
          <div className="flex flex-col gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={streamStatus === 'idle' || streamStatus === 'error'}
              >
                🔴 Start Recording
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  ⏹️ Stop Recording
                </button>
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                  <span>Recording: {formatTime(recordingTime)}</span>
                </div>
              </div>
            )}

            {recordedBlob && (
              <div className="flex items-center gap-3 p-3 bg-green-100 border border-green-300 rounded-md">
                <span className="text-green-800">✅ Recording ready for download</span>
                <button
                  onClick={downloadVideo}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  💾 Download Video
                </button>
              </div>
            )}

            <div className="text-xs text-gray-300 bg-slate-700/50 p-3 rounded border border-slate-600/50">
              💡 <strong>Tip:</strong> Add text/image overlays, then start recording to capture video with overlays. The recording will include all visible overlays.
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default VideoPlayer;

