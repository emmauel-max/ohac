import { useState, useEffect } from 'react';

export default function AppControls() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for the browser recognizing your awesome Vite PWA config
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert('Notifications enabled! You will now receive OHAC updates.');
    }
  };

  return (
    <div className="flex gap-4 p-4">
      {/* The Install Button will ONLY appear if the app isn't installed yet */}
      {deferredPrompt && (
        <button 
          onClick={handleInstallClick} 
          className="bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800"
        >
          Install OHAC App
        </button>
      )}

      <button 
        onClick={requestNotificationPermission} 
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Enable Notifications
      </button>
    </div>
  );
}