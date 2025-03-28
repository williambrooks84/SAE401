import FormBox from "../ui/FormBox";
import Button from "../ui/Button";
import FormLabel from "../ui/FormLabel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const verifyPassword = (password: string, confirmPassword: string) => {
        return password === confirmPassword;
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleSignupClick = async () => {
        let valid = true;

        if (username === '') {
            setUsernameError('Please enter your username.');
            valid = false;
        } else {
            setUsernameError('');
        }

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

        if (!verifyPassword(password, confirmPassword)) {
            setConfirmPasswordError('Passwords do not match.');
            valid = false;
        } else {
            setConfirmPasswordError('');
        }

        if (valid) {
            const response = await fetch("http://localhost:8080/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword,
                }),
            });

            if (response.ok) {
                // Set verification message on successful signup
                setVerificationMessage('User registered successfully. Please verify your email.');
                setTimeout(() => {
                    navigate('/login'); // Redirect to login after a short delay
                }, 3000); // Redirect after 3 seconds
            } else {
                const data = await response.json();
                if (data.error === 'Email is already in use.') {
                    setEmailError(data.error);
                } else if (data.error === 'Username is already taken.') {
                    setUsernameError(data.error);
                } else {
                    setGeneralError(data.error || 'An error occurred during signup.');
                }
            }
        }
    };

    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-7 gap-6">
            <h1 className="text-4xl font-bold text-center text-green">Create an account</h1>
            <div className="flex w-full flex-col gap-2 md:justify-center md:w-1/3 md:mx-auto">
                <FormLabel label="Choose a username:" />
                <FormBox
                    placeholder="Username"
                    value={username}
                    onChange={handleUsernameChange}
                />
                {usernameError && <span className="text-error">{usernameError}</span>}

                <FormLabel label="Enter your email:" />
                <FormBox
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {emailError && <span className="text-error">{emailError}</span>}

                <FormLabel label="Choose a password:" />
                <FormBox
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                {passwordError && <span className="text-error">{passwordError}</span>}

                <FormLabel label="Confirm your password:" />
                <FormBox
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                {confirmPasswordError && <span className="text-error">{confirmPasswordError}</span>}

                {generalError && <span className="text-error">{generalError}</span>}

                {verificationMessage && <div className="text-green">{verificationMessage}</div>}

                <Button variant="bluebgless" size="bgless" rounded="none" onClick={() => navigate('/login')}>
                    Already have an account? Login here
                </Button>
                <Button variant="default" size="default" rounded="default" onClick={handleSignupClick}>
                    Create account
                </Button>
            </div>
        </div>
    );
}