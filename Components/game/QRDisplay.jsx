import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Users } from 'lucide-react';

export default function QRDisplay({ sessionCode, joinUrl }) {
  const [qrUrl, setQrUrl] = useState('');
  
  useEffect(() => {
    // Generate QR code using QRServer API (free and reliable)
    if (joinUrl) {
      const encodedUrl = encodeURIComponent(joinUrl);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`);
    }
  }, [joinUrl]);

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* QR Code Container */}
      <div className="relative">
        {/* Decorative frame */}
        <div className="absolute -inset-4 bg-gradient-to-br from-pink-400 via-purple-400 to-teal-400 rounded-3xl opacity-30 blur-xl" />
        
        <motion.div 
          className="relative bg-white p-6 rounded-2xl shadow-2xl"
          whileHover={{ scale: 1.02 }}
        >
          {/* Corner decorations */}
          <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-pink-500 rounded-tl-xl" />
          <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
          <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl" />
          <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-pink-500 rounded-br-xl" />
          
          {qrUrl ? (
            <img 
              src={qrUrl} 
              alt="Join Game QR Code" 
              className="w-64 h-64 rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading...</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-medium text-gray-700">Scan to Join!</span>
        </div>
        
        {/* Session code display */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Or enter code:</p>
          <p className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            {sessionCode}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
