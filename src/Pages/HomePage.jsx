import { motion } from "framer-motion";
import { Sparkles, Gem, Search, Layers, Filter, BarChart3 } from "lucide-react";

const HomePage = () => {
    return (
        <div className="min-h-full w-full bg-base-100 text-base-content pt-16 px-6 md:px-12">

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-wide flex justify-center gap-3 items-center">
                    Diamond Management
                    <Sparkles className="text-primary" />
                </h1>

                <p className="text-base-content/70 mt-3 text-lg">
                    Smart, Fast & Professional Dashboard for Diamond.
                </p>
            </motion.div>

            {/* CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* CARD TEMPLATE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="bg-base-200/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-300 hover:border-primary cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Gem className="text-primary" size={28} />
                        <h2 className="text-xl font-semibold">Diamond Lots</h2>
                    </div>
                    <p className="text-base-content/70">
                        Manage issue weight, polish weight, HPHT, rate & amount in real-time.
                    </p>
                </motion.div>

                {/* CARD 2 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-base-200/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-300 hover:border-secondary cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="text-secondary" size={28} />
                        <h2 className="text-xl font-semibold">Smart Search</h2>
                    </div>
                    <p className="text-base-content/70">
                        Search by unique ID, filters, date range & instant match.
                    </p>
                </motion.div>

                {/* CARD 3 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-base-200/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-300 hover:border-accent cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Layers className="text-accent" size={28} />
                        <h2 className="text-xl font-semibold">Dynamic Sorting</h2>
                    </div>
                    <p className="text-base-content/70">
                        Sort by unique ID, date, polish date & HPHT date.
                    </p>
                </motion.div>

                {/* CARD 4 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-base-200/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-300 hover:border-warning cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="text-warning" size={28} />
                        <h2 className="text-xl font-semibold">Advanced Filters</h2>
                    </div>
                    <p className="text-base-content/70">
                        Filter by party, kapan, status & payment status.
                    </p>
                </motion.div>

                {/* CARD 5 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-base-200/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-300 hover:border-info cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="text-info" size={28} />
                        <h2 className="text-xl font-semibold">Analytics</h2>
                    </div>
                    <p className="text-base-content/70">
                        Live totals: issue weight, polish weight, HPHT & amount.
                    </p>
                </motion.div>

            </div>

            {/* FOOTER ANIMATION */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="mt-20 text-center text-base-content"
            >
                <p className="text-sm tracking-widest">
                    MANAGE • TRACK • CONTROL • OPTIMIZE
                </p>
            </motion.div>

        </div>
    );
};

export default HomePage;