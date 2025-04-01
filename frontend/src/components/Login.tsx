import FormBox from "../ui/FormBox";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import logo from "../assets/logo-temp.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const { login } = useAuth(); // Get login function from context
    const navigate = useNavigate();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLoginClick = () => {
        let valid = true;

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        } else {
            setEmailError('');
        }

        if (password === '') {
            setPasswordError('Please enter your password.');
            valid = false;
        } else {
            setPasswordError('');
        }

        if (valid) {
            fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.error || 'Login failed');
                    });
                }
                return response.json();
            })
            .then((data) => {
                login(data.token); // Store token in Auth Context

                // Redirect to home page
                navigate('/');
            })
            .catch((error) => {
                setEmailError('');
                setPasswordError(error.message || 'Login failed');
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-7 gap-10 md:w-1/3 md:mx-auto">
            <Logo src={logo} alt="logo"/>
            <div className="flex w-full flex-col gap-2">
                <FormBox placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {emailError && <span className="text-error">{emailError}</span>}
                <FormBox placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {passwordError && <span className="text-error">{passwordError}</span>}
            </div>
            <Button variant="default" size="default" rounded="default" onClick={handleLoginClick}>
                Login
            </Button>
            <div className="gap-2.5">
                <Button variant="greybgless" size="bgless" rounded="none">
                    Forgot Password?
                </Button>
                <Button variant="bluebgless" size="bgless" rounded="none" onClick={() => navigate("/signup")}>
                    Don’t have an account? Sign Up
                </Button>
            </div>
        </div>
    );
}
