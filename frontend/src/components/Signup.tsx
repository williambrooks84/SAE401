import FormBox from "../ui/FormBox";
import Button from "../ui/Button";
import FormLabel from "../ui/FormLabel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";

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
    const [passwordStrength, setPasswordStrength] = useState('');

    const navigate = useNavigate();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const verifyPassword = (password: string, confirmPassword: string) => password === confirmPassword;

    const checkPasswordStrength = (password: string) => {
        if (password.length < 6) return "Weak";
        if (password.length >= 6 && password.length < 10) return "Medium";
        if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return "Strong";
        return "Medium";
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(checkPasswordStrength(newPassword));
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

    const handleSignupClick = async () => {
        let valid = true;

        setUsernameError(username ? "" : "Please enter your username.");
        setEmailError(validateEmail(email) ? "" : "Please enter a valid email address.");
        setPasswordError(password ? "" : "Please enter your password.");
        setConfirmPasswordError(verifyPassword(password, confirmPassword) ? "" : "Passwords do not match.");

        valid = !!username && validateEmail(email) && !!password && verifyPassword(password, confirmPassword);

        if (valid) {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                setVerificationMessage('User registered successfully. Please verify your email.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const data = await response.json();
                setEmailError(data.error === 'Email is already in use.' ? data.error : '');
                setUsernameError(data.error === 'Username is already taken.' ? data.error : '');
                setGeneralError(data.error || 'An error occurred during signup.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-7 gap-6">
            <h1 className="text-4xl font-bold text-center text-green">Create an account</h1>
            <div className="flex w-full flex-col gap-2 md:w-1/3 md:mx-auto">
                <FormLabel label="Choose a username:" />
                <FormBox placeholder="Username" value={username} onChange={handleUsernameChange} />
                {usernameError && <span className="text-error">{usernameError}</span>}

                <FormLabel label="Enter your email:" />
                <FormBox placeholder="Email" value={email} onChange={handleEmailChange} />
                {emailError && <span className="text-error">{emailError}</span>}

                <FormLabel label="Choose a password:" />
                <FormBox placeholder="Password" value={password} onChange={handlePasswordChange} />
                {passwordError && <span className="text-error">{passwordError}</span>}
                {password && (
                    <span
                        className={`${
                            passwordStrength === "Weak"
                                ? "text-error"
                                : passwordStrength === "Medium"
                                ? "text-yellow"
                                : "text-nav-green"
                        }`}
                    >
                        Password Strength: {passwordStrength}
                    </span>
                )}

                <FormLabel label="Confirm your password:" />
                <FormBox placeholder="Confirm password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
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
