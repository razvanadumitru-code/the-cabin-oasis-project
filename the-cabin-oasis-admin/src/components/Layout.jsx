import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ currentPage, setCurrentPage, children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        <Navbar currentPage={currentPage} />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
