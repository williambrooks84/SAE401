import Logo from "../ui/Logo";
import logo from "../assets/logo-temp.png";

export default function DashboardHeader() {
    return (
        <div>
            <div className="flex flex-row justify-between items-center md:justify-center md:gap-10 bg-header-bg p-4">
            <Logo src={logo} alt="logo" className="w-36 h-8" />
            <h1 className="text-2xl font-semibold text-center text-header-text">Administrator Dashboard</h1>    
            </div>    
        </div>
    );
}