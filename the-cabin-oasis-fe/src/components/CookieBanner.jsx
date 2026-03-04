import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setVisible(true);
      }
    } catch (e) {
      console.error('Error reading cookie consent from localStorage', e);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookieConsent', 'accepted');
    } catch (e) {
      console.error('Error saving cookie consent to localStorage', e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="max-w-6xl mx-auto px-4 pb-4">
        <div className="bg-green-900/90 text-green-50 rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <p className="text-sm sm:text-base flex-1">
            We use cookies to improve your experience on The Cabin Oasis, for example to keep your
            booking details during the reservation process. By continuing to use this site, you
            accept our use of cookies.
          </p>
          <button
            type="button"
            onClick={handleAccept}
            className="mt-1 sm:mt-0 px-4 py-2 rounded-lg bg-fern-500 hover:bg-fern-400 text-white text-sm font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
