import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
export function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center space-y-8 max-w-lg">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-[10rem] font-black leading-none text-teal-gradient select-none">
                        404
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="space-y-4"
                >
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        Page Not Found
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 border border-[rgba(22,160,133,0.4)] bg-[rgba(21,86,91,0.2)] text-white hover:bg-[rgba(22,160,133,0.15)] text-base px-8 py-4 font-bold rounded-2xl transition-all duration-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center justify-center gap-2 bg-[#16A085] text-white hover:bg-[#168777] glow-teal text-base px-8 py-4 font-bold rounded-2xl shadow-lg transition-all duration-300"
                    >
                        <Home className="h-5 w-5" />
                        Home Page
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
