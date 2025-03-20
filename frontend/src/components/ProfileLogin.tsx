import Button from "../ui/Button"
import { useNavigate } from "react-router-dom";

export default function ProfileLogin() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-2.5">
                <p className="text-center text-lg font-bold">You are currently not logged in.</p>
                <Button variant="default" size="default" rounded="default" width="fit" padding="default" onClick={() => navigate("/login")}>
                    Login
                </Button>
            </div>
            <Button variant="bluebgless" size="bgless" rounded="none" width="fit" onClick={() => navigate("/signup")}>
                Don’t have an account? Sign Up
            </Button>
        </div>
    )
}