import Home from "./components/Home"
import Login from "./components/Login";
import Signup from "./components/Signup";
import Publish from "./components/Publish";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/publish" element={<Publish />}/>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}