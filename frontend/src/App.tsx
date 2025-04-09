import Home from "./components/Home"
import Login from "./components/Login";
import Signup from "./components/Signup";
import Publish from "./components/Publish";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import EditPost from "./components/EditPost";
import ForYou from "./components/ForYou";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element = {<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/publish" element={<Publish />}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<Profile/>} />
          <Route path="/editprofile" element={<EditProfile/>} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/foryou" element={<ForYou />} />
        </Routes>
      </Router>
    </AuthProvider>  
  )
}