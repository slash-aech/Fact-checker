import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Form from './components/Form';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Form />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
