import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Imports from './pages/Imports';
import LeadsWithAI from './pages/LeadsWithAI';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI Sales Ops Copilot
              </Link>
              <div className="flex gap-8">
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/imports" className="text-slate-300 hover:text-white transition-colors">
                  Imports
                </Link>
                <Link to="/leads" className="text-slate-300 hover:text-white transition-colors">
                  Leads
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-8 py-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/imports" element={<Imports />} />
            <Route path="/leads" element={<LeadsWithAI />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-800 mt-20">
          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              © 2026 <span className="text-blue-400 font-semibold">Daniel Aryee</span>. All rights reserved.
            </p>
            <p className="text-slate-600 text-sm">
              Built with React, Node.js & MongoDB
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
