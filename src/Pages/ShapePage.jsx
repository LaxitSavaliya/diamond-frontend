import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addShape, shapeData, updateShape, deleteShape } from "../Lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ShapePage = () => {
    const [page, setPage] = useState(1);

    const [name, setName] = useState("");
    const [editId, setEditId] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const [openDeleteModal, setOpenDeleteModal] = useState({
        name: "",
        id: ""
    });

    const [status, setStatus] = useState("All");

    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setSearchTerm(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const queryClient = useQueryClient();

    const { data: shapes } = useQuery({
        queryKey: ["shape", page, searchTerm, status],
        queryFn: () => shapeData(page, searchTerm, status),
    });

    const createShapeMutation = useMutation({
        mutationFn: addShape,
        onSuccess: () => {
            toast.success("Shape added successfully");
            queryClient.invalidateQueries({ queryKey: ["shape"] });
        },
    });

    const updateShapeMutation = useMutation({
        mutationFn: ({ id, newData }) => updateShape(id, newData),
        onSuccess: () => {
            toast.success("Updated");
            queryClient.invalidateQueries({ queryKey: ["shape"] });
        },
    });

    const deleteShapeMutation = useMutation({
        mutationFn: deleteShape,
        onSuccess: () => {
            toast.success("Shape deleted");
            queryClient.invalidateQueries({ queryKey: ["shape"] });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editId) {
            updateShapeMutation.mutate({ id: editId, newData: { name } });
        } else {
            createShapeMutation.mutate({ name, active: true });
        }

        setName("");
        setEditId(null);
        setOpenModal(false);
    };

    const toggleActive = (shape) => {
        updateShapeMutation.mutate({
            id: shape._id,
            newData: { active: !shape.active },
        });
    };

    const startEdit = (shape) => {
        setEditId(shape._id);
        setName(shape.name);
        setOpenModal(true);
    };

    const openAddModal = () => {
        setEditId(null);
        setName("");
        setOpenModal(true);
    };

    return (
        <div className="w-full p-3 md:p-6 h-full overflow-auto max-h-[87vh] scrollbar-hide flex flex-col bg-base-100 text-base-content">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Shape Management</h1>

                <button onClick={openAddModal} className="md:hidden btn btn-primary">
                    Add
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex justify-between mb-4">
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

                <button onClick={openAddModal} className="hidden md:inline btn btn-primary">
                    Add
                </button>
            </div>

            {/* TABLE */}
            <div className="rounded-2xl shadow-md mt-5 overflow-auto border border-base-content bg-base-100">
                <table className="min-w-full table-fixed">
                    <thead className="bg-slate-400 text-base-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-semibold text-left">No</th>
                            <th className="p-4 font-semibold text-left">Shape</th>
                            <th className="p-4 font-semibold text-center">Active</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {shapes?.data?.map((shape, idx) => (
                            <tr key={shape._id} className="border-t border-base-content hover:bg-base-300">
                                <td className="p-4">{(page - 1) * 5 + (idx + 1)}</td>

                                <td className="p-4 font-medium">{shape.name}</td>

                                {/* ACTIVE SWITCH */}
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleActive(shape)}
                                        className={`cursor-pointer relative inline-flex h-6 w-12 items-center rounded-full transition ${shape.active ? "bg-base-content" : "bg-neutral-content opacity-70"}`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-base-100 transition ${shape.active ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => startEdit(shape)}
                                            className="btn btn-outline btn-primary btn-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setOpenDeleteModal({ name: shape.name, id: shape._id })}
                                            className="btn btn-error btn-sm text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="mt-auto py-2 flex justify-center items-center gap-5 sticky bottom-0 bg-base-100 bg-opacity-80 backdrop-blur-md">
                <ChevronLeft
                    className="cursor-pointer hover:bg-base-300 rounded-full p-1 size-8"
                    onClick={() => page > 1 && setPage((p) => p - 1)}
                />

                <span>
                    {page} / {shapes?.totalPages}
                </span>

                <ChevronRight
                    className="cursor-pointer hover:bg-base-300 rounded-full p-1 size-8"
                    onClick={() => page < shapes?.totalPages && setPage((p) => p + 1)}
                />
            </div>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm p-3">
                    <div className="p-6 rounded-2xl w-full max-w-md shadow-xl border border-base-300 bg-base-200">
                        <h2 className="text-2xl font-bold mb-4">
                            {editId ? "Update Shape" : "Add Shape"}
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Enter Shape Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="btn btn-primary text-white">
                                    {editId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openDeleteModal.id && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-xs p-3">
                    <div className="p-6 rounded-2xl w-full max-w-md shadow-xl border border-base-300 bg-base-200">
                        <h2 className="text-2xl font-bold mb-4">
                            Delete {openDeleteModal.name}
                        </h2>

                        <p className="pb-5 pt-2">Are you sure you want to delete {openDeleteModal.name}?</p>
                        <div className="flex justify-end gap-3">
                            <button className="btn btn-soft btn-sm text-shadow-success-content" onClick={() => setOpenDeleteModal({ name: "", id: "" })}>Cancel</button>
                            <button className="btn btn-error btn-sm text-shadow-success-content" onClick={() => { deleteShapeMutation.mutate(openDeleteModal.id); setOpenDeleteModal({ name: "", id: "" }); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShapePage;