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

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const verifyPassword = (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            return false;
        }
        return true;
    }

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

    const handleSignupClick = () => {
        let valid = true;

        if (username === '') {
            setUsernameError('Please enter your username.');
            valid = false;
        } else {
            setUsername('');
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
            navigate('/');
            //navigate('/login');
        }
    };

    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-7 gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-green">Create an account</h1>
            <div className="flex w-full flex-col gap-2">
                <FormLabel label="Choose a username:"/>
                <FormBox
                    placeholder="Username"
                    value={username}
                    onChange={handleUsernameChange}
                />
                {usernameError && <span className="text-error">{usernameError}</span>}
                
                <FormLabel label="Enter your email:"/>
                <FormBox
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {emailError && <span className="text-error">{emailError}</span>}
                
                <FormLabel label="Choose a password:"/>
                <FormBox
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                {passwordError && <span className="text-error">{passwordError}</span>}
                
                <FormLabel label="Confirm your password:"/>
                <FormBox
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                {passwordError && <span className="text-error">{confirmPasswordError}</span>}
            </div>
            <Button variant="bluebgless" size="bgless" rounded="none" onClick={() => navigate('/login')}>
                Already have an account? Login here 
            </Button>
            <Button variant="default" size="default" rounded="default" onClick = {handleSignupClick}>
                Create account
            </Button>
        </div>
    )


}