import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeData, addEmployee, updateEmployee, deleteEmployee } from "../Lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonRow from "../Components/SkeletonRow";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../Components/Common/Pagination";

const EmployeePage = () => {
    const [page, setPage] = useState(1);
    const [name, setName] = useState("");
    const [editId, setEditId] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const [updatingId, setUpdatingId] = useState(null);

    const [openDeleteModal, setOpenDeleteModal] = useState({
        name: "",
        id: ""
    });

    const [status, setStatus] = useState("All");
    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    /* SEARCH DEBOUNCE */
    useEffect(() => {
        const timeout = setTimeout(() => setSearchTerm(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const queryClient = useQueryClient();

    /* ============================
            FETCH EMPLOYEE DATA
       ============================ */
    const { data: employees, isLoading } = useQuery({
        queryKey: ["employee", page, searchTerm, status],
        queryFn: () => employeeData(page, searchTerm, status),
    });

    /* ============================
            CREATE EMPLOYEE
       ============================ */
    const createEmployeeMutation = useMutation({
        mutationFn: addEmployee,
        onSuccess: () => {
            toast.success("Employee added successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["employee"] });
        },
    });

    /* ============================
            UPDATE EMPLOYEE
       ============================ */
    const updateEmployeeMutation = useMutation({
        mutationFn: async ({ id, newData }) => {
            setUpdatingId(id);
            return updateEmployee(id, newData);
        },
        onSuccess: () => {
            toast.success("Employee updated successfully");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["employee"] });
        },
        onSettled: () => {
            setUpdatingId(null);
        }
    });

    /* ============================
            DELETE EMPLOYEE
       ============================ */
    const deleteEmployeeMutation = useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            toast.success("Employee deleted");
            queryClient.invalidateQueries({ queryKey: ["employee"] });
        }
    });

    /* ============================
            HANDLE SUBMIT
       ============================ */
    const closeModal = () => {
        setOpenModal(false);
        setName("");
        setEditId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editId) {
            updateEmployeeMutation.mutate({ id: editId, newData: { name } });
        } else {
            createEmployeeMutation.mutate({ name, active: true });
        }
    };

    return (
        <div className="w-full py-5 px-3 md:p-6 h-full overflow-auto md:max-h-[87vh] scrollbar-hide flex flex-col bg-base-100 text-base-content">

            {/* ======================= HEADER ======================= */}
            <div className="flex justify-between items-center mb-4">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-3xl font-bold"
                >
                    Employee Management
                </motion.h1>

                <motion.button
                    onClick={() => { setEditId(null); setOpenModal(true); }}
                    whileTap={{ scale: 0.95 }}
                    className="md:hidden btn btn-primary"
                >
                    Add
                </motion.button>
            </div>

            {/* ======================= FILTERS ======================= */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-3 md:gap-10 md:pl-4">
                    <input
                        className="input input-bordered w-40 md:w-60"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                    />

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="select select-bordered w-40 md:w-48 cursor-pointer"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                    </select>
                </div>

                <motion.button
                    onClick={() => { setEditId(null); setOpenModal(true); }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:inline btn btn-primary"
                >
                    Add
                </motion.button>
            </div>

            {/* ======================= TABLE ======================= */}
            <div className="rounded-2xl shadow-md mt-5 overflow-auto border border-base-content bg-base-100 scrollbar-hide">
                <table className="min-w-full table-fixed">
                    <thead className="bg-slate-400 text-base-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-semibold text-left">No</th>
                            <th className="p-4 font-semibold text-left">Employee</th>
                            <th className="p-4 font-semibold text-center">Active</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                        ) : (
                            employees?.data?.map((employee, idx) => (
                                <motion.tr
                                    key={employee._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: idx * 0.07,
                                        ease: "easeOut"
                                    }}
                                    className="border-t border-base-content hover:bg-base-300"
                                >
                                    <td className="p-4">{(page - 1) * 5 + (idx + 1)}</td>

                                    <td className="p-4 font-medium">{employee.name}</td>

                                    {/* ======================= TOGGLE BUTTON ======================= */}
                                    <td className="p-4 text-center">
                                        <motion.button
                                            disabled={updatingId === employee._id}
                                            whileTap={{
                                                scale: updatingId === employee._id ? 1 : 0.9,
                                            }}
                                            onClick={() =>
                                                updateEmployeeMutation.mutate({
                                                    id: employee._id,
                                                    newData: { active: !employee.active },
                                                })
                                            }
                                            className={`
                                                relative inline-flex h-6 w-12 items-center rounded-full transition cursor-pointer
                                                ${employee.active ? "bg-base-content" : "bg-neutral-content opacity-70"}
                                                ${updatingId === employee._id ? "opacity-60" : ""}
                                            `}
                                        >
                                            <motion.span
                                                animate={{
                                                    x: employee.active ? 24 : 4,
                                                    scale: updatingId === employee._id ? 0.7 : 1,
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                                className="inline-block h-5 w-5 rounded-full bg-base-100 relative"
                                            >
                                                <AnimatePresence>
                                                    {updatingId === employee._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 flex justify-center items-center"
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 0.6,
                                                                    ease: "linear"
                                                                }}
                                                                className="h-3 w-3 border-[2px] border-t-transparent border-base-content rounded-full"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.span>
                                        </motion.button>
                                    </td>

                                    {/* ======================= ACTIONS ======================= */}
                                    <td className="p-4">
                                        <div className="flex gap-3 justify-center">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setEditId(employee._id);
                                                    setName(employee.name);
                                                    setOpenModal(true);
                                                }}
                                                className="btn btn-outline btn-primary btn-sm"
                                            >
                                                Edit
                                            </motion.button>

                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    setOpenDeleteModal({
                                                        name: employee.name,
                                                        id: employee._id,
                                                    })
                                                }
                                                className="btn btn-error btn-sm text-white"
                                            >
                                                Delete
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ======================= PAGINATION ======================= */}
            <Pagination page={page} totalPages={employees?.totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />

            {/* ======================= ADD / EDIT MODAL ======================= */}
            <AnimatePresence>
                {openModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-xs p-3"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="p-6 rounded-2xl w-full max-w-md shadow-xl border border-base-300 bg-base-200"
                        >
                            <h2 className="text-xl font-bold mb-4">
                                {editId ? "Update Employee" : "Add Employee"}
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter Employee Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input input-bordered w-full"
                                />

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary text-white"
                                        aria-disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                                    >
                                        {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
                                            ? (editId ? "Updating..." : "Adding...")
                                            : (editId ? "Update" : "Add")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ======================= DELETE MODAL ======================= */}
            <AnimatePresence>
                {openDeleteModal.id && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm p-3"
                    >
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            className="p-6 rounded-2xl w-full max-w-md shadow-xl border border-base-300 bg-base-200"
                        >
                            <h2 className="text-2xl font-bold mb-3">
                                Delete {openDeleteModal.name}
                            </h2>

                            <p className="pb-4 pt-2">
                                Are you sure you want to delete {openDeleteModal.name}?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    className="btn btn-soft btn-sm"
                                    onClick={() =>
                                        setOpenDeleteModal({ name: "", id: "" })
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-error btn-sm text-white"
                                    onClick={() => {
                                        deleteEmployeeMutation.mutate(openDeleteModal.id);
                                        setOpenDeleteModal({ name: "", id: "" });
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default EmployeePage;