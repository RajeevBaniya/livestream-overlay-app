import React from 'react';
import VideoPlayer from '../components/VideoPlayer';

function Landing() {
  return (
    <div className="max-w-7xl mx-auto p-4 pt-2 flex flex-col">
      <header className="text-center text-white mb-3">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-purple-400 bg-clip-text text-transparent">Watch live video streams with custom overlays</h1>
      </header>
      
      <main className="flex justify-center">
        <VideoPlayer />
      </main>
    </div>
  );
}

export default Landing;

