import { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
      {message}
      <button onClick={onClose} className="ml-4 font-bold">&times;</button>
    </div>
  );
};

export default Toast;
