import Home from "./components/Home"
import Login from "./components/Login";
import Signup from "./components/Signup";
import Publish from "./components/Publish";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/publish" element={<Publish />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:userId" element={<Profile/>} />
      </Routes>
    </Router>
  )
}