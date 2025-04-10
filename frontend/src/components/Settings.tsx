import { CrossIcon } from "../assets/icons";
import FormLabel from "../ui/FormLabel";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ProfileLoginProps } from "../interfaces/dataDefinitions";

export default function Settings({ isVisible, onClose }: ProfileLoginProps) {
    const {user} = useAuth();
    const userId = user?.userId;

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30);

    useEffect(() => {
        const savedAutoRefresh = localStorage.getItem("autoRefresh");
        const savedInterval = localStorage.getItem("refreshInterval");

        if (savedAutoRefresh !== null) {
            setAutoRefresh(savedAutoRefresh === "true");
        }
        if (savedInterval !== null) {
            setRefreshInterval(Number(savedInterval));
        }
    }, []);

    // Sauvegarder les paramètres dès qu'ils changent
    useEffect(() => {
        localStorage.setItem("autoRefresh", autoRefresh.toString());
        localStorage.setItem("refreshInterval", refreshInterval.toString());
    }, [autoRefresh, refreshInterval]);

    useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-18 left-0 right-0 mx-2 md:left-1/2 md:transform md:-translate-x-1/2 max-w-full md:max-w-1/4 shadow-lg z-50 h-fit bg-post-background px-5 py-10 rounded-4xl">
            <button onClick={onClose} className="absolute top-3 left-3">
            <CrossIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center w-full gap-3">
            <FormLabel label="Automatic refresh" size="large" weight="semibold" color="default" className="flex items-center space-x-2"/>
            <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
            />

            <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
            className={`border p-1 rounded ${!autoRefresh ? "bg-gray-200 cursor-not-allowed" : ""}`}
            >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1 min</option>
            </select>
            </div>
            <div className="my-4 border-t border-black"></div>
            <div className="flex flex-col items-start">
                <a href="/dashboard" className="text-lg font-bold">Administrator Dashboard</a>
                <a href={`/blocklist/${userId}`} className="text-lg font-bold">Blocked users</a>
            </div>
        </div>
    )
}