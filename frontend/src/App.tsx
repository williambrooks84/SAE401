import Home from "./components/Home"
import Login from "./components/Login";
import Signup from "./components/Signup";
import Publish from "./components/Publish";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfileLogin from "./components/ProfileLogin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/publish" element={<Publish />}/>
      </Routes>
    </Router>
  )
}