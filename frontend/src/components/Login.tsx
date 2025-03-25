import FormBox from "../ui/FormBox";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import logo from "../assets/logo-temp.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

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
                console.log('Login successful:', data);
                navigate('/'); // Navigate to a dashboard or another page
            });
        }
    };

    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-7 gap-10 md:w-1/3 md:mx-auto">
            <Logo src={logo} alt="logo"/>
            <div className="flex w-full flex-col gap-2">
                <FormBox
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {emailError && <span className="text-error">{emailError}</span>}
                <FormBox
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
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