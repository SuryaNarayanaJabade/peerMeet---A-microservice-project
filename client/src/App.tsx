import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Meeting } from './pages/Meeting';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/meeting/:id" element={
          <ProtectedRoute>
            <Meeting />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
