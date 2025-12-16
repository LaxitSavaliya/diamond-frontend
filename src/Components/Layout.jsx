import {
    Box,
    Gem,
    LayoutDashboard,
    PaintbrushVertical,
    PersonStanding,
    FileChartPie,
    CircleDollarSign,
    ClipboardType,
    Menu,
    Eye,
    EyeClosed,
    Monitor,
    LogOut,
    FileText,
    User2,
    NotepadText
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";
import { useThemeStore } from "../Store/useThemeStore";
import Filter from "./Filter";
import { logout } from "../Lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Layout = ({ user, children, onToggle, showTotal, showIcon }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { theme } = useThemeStore();

    const queryClient = useQueryClient();

    const { mutate: logoutMutation } = useMutation({
        mutationFn: logout,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
    });

    return (
        <div className="drawer lg:drawer-open h-full transition-all duration-300" data-theme={theme}>
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

            {/* MAIN CONTENT */}
            <div className="drawer-content flex flex-col">
                {/* NAVBAR */}
                <nav className="navbar w-full border-b px-4 shadow-sm flex justify-between sticky top-0 z-50 bg-base-100">
                    <label
                        htmlFor="my-drawer-4"
                        aria-label="open sidebar"
                        className="p-2 rounded-lg cursor-pointer transition hover:bg-base-300"
                    >
                        <Menu size={24} />
                    </label>

                    <div className="flex gap-3 items-center">

                        {(currentPath === "/diamond-table" && showIcon === true) && (
                            <button onClick={onToggle} className="btn btn-ghost btn-circle p-0.5 rounded-full transition hover:bg-base-300 cursor-pointer">
                                {showTotal ? (
                                    <Eye className="size-6" />
                                ) : (
                                    <EyeClosed className="size-6" />)}
                            </button>
                        )}

                        <div className="p-0.5 rounded-full transition hover:bg-base-300 cursor-pointer">
                            <ThemeSelector />
                        </div>

                        {(currentPath === "/diamond-table" && showIcon === true) && (
                            <div className="p-0.5 rounded-full transition hover:bg-base-300 cursor-pointer">
                                <Filter />
                            </div>
                        )}
                    </div>
                </nav>

                {/* PAGE CONTENT */}
                <div className="flex-1 md:p-4 overflow-auto scrollbar-hide transition-all duration-300">
                    {children}
                </div>
            </div>

            {/* SIDEBAR */}
            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" className="drawer-overlay"></label>

                <aside className="min-h-full flex flex-col shadow-xl transition-all duration-300 border-r is-drawer-close:w-16 is-drawer-open:w-64 bg-base-100">
                    {/* USER HEADER */}
                    <div className="h-16 border-b flex items-center gap-3 px-3">
                        <span className="px-4 py-2 rounded-xl font-bold text-xl bg-base-content text-base-100 shadow-lg">
                            {user?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className="text-xl font-semibold is-drawer-close:hidden">{user}</span>
                    </div>

                    {/* MENU */}
                    <ul className="menu w-full flex-1 px-2 gap-1.5">
                        {[
                            { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
                            { to: "/color", label: "Color", icon: <PaintbrushVertical className="size-5" /> },
                            { to: "/clarity", label: "Clarity", icon: <Gem className="size-5" /> },
                            { to: "/shape", label: "Shape", icon: <Box className="size-5" /> },
                            { to: "/party", label: "Party", icon: <PersonStanding className="size-5" /> },
                            { to: "/status", label: "Status", icon: <FileChartPie className="size-5" /> },
                            { to: "/paymentStatus", label: "PaymentStatus", icon: <CircleDollarSign className="size-5" /> },
                            { to: "/rate", label: "Rate", icon: <Monitor className="size-5" /> },
                            { to: "/form", label: "Form", icon: <ClipboardType className="size-5" /> },
                            { to: "/diamond-table", label: "Diamond", icon: <Gem className="size-5" /> },
                            { to: "/record", label: "Record", icon: <FileText className="size-5" /> },
                            { to: "/employee", label: "Employee", icon: <User2 className="size-5" /> },
                            { to: "/employee-attendance", label: "Attendance", icon: <NotepadText className="size-5" /> },
                        ].map((menu, i) => (
                            <li key={i}>
                                <Link
                                    to={menu.to}
                                    className={`flex gap-3 items-center py-2 px-3.5 rounded-lg transition text-base is-drawer-close:tooltip is-drawer-close:tooltip-right ${currentPath === menu.to ? "bg-base-content text-base-100 shadow-md" : "hover:bg-base-200"}`}
                                    data-tip={menu.label}
                                >
                                    <div>{menu.icon}</div>
                                    <span className="is-drawer-close:hidden">{menu.label}</span>
                                </Link>
                            </li>
                        ))}
                        <li className="mt-auto">
                            <div className="flex gap-3 items-center p-3 rounded-lg transition text-base is-drawer-close:tooltip is-drawer-close:tooltip-right hover:bg-base-200" data-tip="Logout" onClick={logoutMutation}>
                                <LogOut className="size-5.6" />
                                <span className="is-drawer-close:hidden">Logout</span>
                            </div>
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default Layout;