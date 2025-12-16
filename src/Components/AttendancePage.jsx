import { useMemo, useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAttendance, allAttendance } from "../Lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const AttendancePage = () => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const years = useMemo(() => {
        const arr = [];
        for (let y = year - 5; y <= year + 5; y++) arr.push(y);
        return arr;
    }, [year]);

    return (
        <div className="flex flex-col gap-6 p-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-base-content">Attendance</h1>
                <div className="flex gap-2">
                    <select
                        className="select select-bordered select-sm w-20 md:w-30"
                        value={month}
                        onChange={(e) => setMonth(+e.target.value)}
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                        className="select select-bordered select-sm md:w-30"
                        value={year}
                        onChange={(e) => setYear(+e.target.value)}
                    >
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <AttendanceList month={month} year={year} />
        </div>
    );
};

export default AttendancePage;

const AttendanceList = ({ month, year }) => {
    const today = new Date();
    const todayDate = today.getDate();
    const totalDays = useMemo(() => daysInMonth(year, month), [year, month]);
    const queryClient = useQueryClient();
    const inputRef = useRef(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["attendance", month, year],
        queryFn: () => allAttendance(month + 1, year),
        keepPreviousData: true,
    });

    const [selectedCell, setSelectedCell] = useState({ employeeId: null, date: null, status: "" });

    const addAttendanceMutation = useMutation({
        mutationFn: addAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance", month, year] });
            setSelectedCell({ employeeId: null, date: null, status: "" });
        },
        onError: () => toast.error("Failed to save attendance"),
    });

    // Click outside to reset selected
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setSelectedCell({ employeeId: null, date: null, status: "" });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) return <SkeletonTable days={totalDays} />;
    if (isError) return <div className="alert alert-error">Failed to load data</div>;

    const attendanceData = data?.data || [];
    const mapAttendance = (attendance = []) => {
        const map = {};
        attendance.forEach(a => map[new Date(a.date).getDate()] = a.status);
        return map;
    };

    const handleCellSelect = (day, employeeId) => {
        setSelectedCell({
            employeeId,
            date: new Date(year, month, day).toISOString(),
            status: "",
        });
    };

    const isActive = (employeeId, day) =>
        selectedCell.employeeId === employeeId &&
        selectedCell.date &&
        new Date(selectedCell.date).getDate() === day;

    const handleSubmit = (payload) => {
        if (!payload.employeeId || !payload.date || !payload.status) return;
        addAttendanceMutation.mutate(payload);
    };

    const markAllPresent = () => {
        attendanceData.forEach(record => {
            const payload = {
                employeeId: record.employeeId._id,
                date: new Date(year, month, todayDate).toISOString(),
                status: "Present",
            };
            addAttendanceMutation.mutate(payload);
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-end">
                <button
                    className="btn btn-primary btn-sm hover:btn-success transition-all"
                    onClick={markAllPresent}
                >
                    Mark All Present Today
                </button>
            </div>

            <div className="overflow-auto rounded-xl max-h-[77vh] md:max-h-[67vh] border scrollbar-hide">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="sticky top-0 bg-slate-500 text-base-100 z-10 py-2">Employee</th>
                            {Array.from({ length: totalDays }, (_, i) => (
                                <th key={i} className="text-center border-l border-base-content sticky top-0 bg-slate-500 text-base-100 z-10 p-1.5">
                                    {i + 1}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((record, idx) => {
                            const statusMap = mapAttendance(record.attendance);
                            return (
                                <motion.tr
                                    key={record.employeeId._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                                    className="hover:bg-base-200 transition-all"
                                >
                                    <td className="font-medium whitespace-nowrap border-t border-base-content bg-slate-500 text-base-100 py-1 px-2 w-40">
                                        {record.employeeId.name}
                                    </td>
                                    {Array.from({ length: totalDays }, (_, i) => {
                                        const day = i + 1;
                                        const active = isActive(record.employeeId._id, day);
                                        const value = statusMap[day];
                                        const cellDate = new Date(year, month, day);
                                        const isFuture = cellDate > today;

                                        return (
                                            <td
                                                key={day}
                                                onClick={() => !isFuture && handleCellSelect(day, record.employeeId._id)}
                                                className={`text-center cursor-pointer border-l border-t p-1 md:p-0 ${isFuture ? "opacity-40 cursor-not-allowed" : ""}`}
                                            >
                                                {isFuture ? (
                                                    <span className="text-base-content/50">-</span>
                                                ) : active ? (
                                                    <select
                                                        ref={inputRef}
                                                        className="select select-xs select-bordered w-10"
                                                        value={selectedCell.status}
                                                        onChange={(e) => {
                                                            const payload = { ...selectedCell, status: e.target.value };
                                                            setSelectedCell(payload);
                                                            handleSubmit(payload);
                                                        }}
                                                    >
                                                        <option value="" disabled>Attendance</option>
                                                        <option value="Present">Present</option>
                                                        <option value="Halfday">Half Day</option>
                                                        <option value="Absent">Absent</option>
                                                    </select>
                                                ) : (
                                                    <span className={`py-0.5 px-1.5 ${value === "Present" ? "badge badge-md badge-success" :
                                                        value === "Absent" ? "badge badge-md badge-error" :
                                                            value === "Halfday" ? "badge badge-md badge-warning" :
                                                                ""
                                                        }`}>
                                                        {value === "Present" ? "P" :
                                                            value === "Absent" ? "A" :
                                                                value === "Halfday" ? "H" :
                                                                    "-"
                                                        }
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SkeletonTable = ({ days }) => (
    <div className="card bg-base-100 shadow-md rounded-xl animate-pulse overflow-auto scrollbar-hide">
        <div className="card-body p-4">
            <table className="table table-compact w-full">
                <tbody>
                    {Array.from({ length: 5 }).map((_, r) => (
                        <tr key={r}>
                            <td><div className="skeleton h-4 w-32 rounded"></div></td>
                            {Array.from({ length: days }).map((_, c) => (
                                <td key={c}><div className="skeleton h-4 w-6 mx-auto rounded"></div></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);