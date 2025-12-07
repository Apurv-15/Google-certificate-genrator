import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const GoogleLoader = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Show loader for at least 2 seconds for smooth UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
                >
                    <div className="text-center">
                        {/* Google Logo Animation */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-center gap-2">
                                {/* Google-style animated dots */}
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: "hsl(217, 89%, 61%)" }} // Google Blue
                                />
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.2,
                                    }}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: "hsl(4, 90%, 58%)" }} // Google Red
                                />
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.4,
                                    }}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: "hsl(45, 100%, 51%)" }} // Google Yellow
                                />
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.6,
                                    }}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: "hsl(142, 76%, 36%)" }} // Google Green
                                />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <h1 className="text-4xl font-medium text-foreground">
                                Google Developer Certificate
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Official Certificate Generator
                            </p>
                        </motion.div>

                        {/* Progress bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 w-64 mx-auto"
                        >
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.8, ease: "easeInOut" }}
                                    className="h-full rounded-full"
                                    style={{
                                        background: "linear-gradient(90deg, hsl(217, 89%, 61%), hsl(4, 90%, 58%), hsl(45, 100%, 51%), hsl(142, 76%, 36%))",
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
