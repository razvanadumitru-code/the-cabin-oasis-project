import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';
import Rooms from './pages/rooms';
import Booking from './pages/booking';
import Payment from './pages/payment';
import PaymentSuccess from './pages/paymentSuccess';
import PaymentCancel from './pages/paymentCancel';
import CabinDetails from './pages/cabinDetails';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ChatBot from './components/ChatBot';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            <Route path="/cabin/:id" element={<CabinDetails />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
        <CookieBanner />
      </div>
    </Router>
  );
}

export default App;

