import { Link } from 'react-router-dom';
import cabinBackground from '../images/cabin_background.png';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main 
        className="min-h-screen bg-cover bg-center flex items-center justify-center text-white px-4 sm:px-8 lg:px-16"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${cabinBackground})` 
        }}
      >
        <div className="max-w-4xl w-full flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-8 text-shadow-lg leading-tight">
            Welcome to The Cabin Oasis
          </h1>
          <div className="flex justify-center mt-8 sm:mt-12 w-full">
            <Link 
              to="/rooms" 
              className="bg-fern-400 hover:bg-fern-500 text-pine_teal-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-xl shadow-fern-400/50 whitespace-nowrap"
            >
              Explore our Cabins
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
