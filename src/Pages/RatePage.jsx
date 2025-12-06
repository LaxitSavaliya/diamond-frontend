import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { allParty, getRates, createRate, addRate, deleteRateItem } from "../Lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

const RatePage = () => {
    const queryClient = useQueryClient();

    // ---------------- STATES ----------------
    const [partyId, setPartyId] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [selectedRateId, setSelectedRateId] = useState("");

    const [openDeleteModal, setOpenDeleteModal] = useState({
        id: "",
        data: { itemId: "" }
    });

    const [form, setForm] = useState({
        startingValue: "",
        endingValue: "",
        rate: "",
        date: "",
    });

    const [addForm, setAddForm] = useState({ rate: "", date: "" });

    const [editForm, setEditForm] = useState({ rate: "", date: "" });
    const [editRateId, setEditRateId] = useState("");
    const [editItemId, setEditItemId] = useState("");


    // ---------------- FETCH QUERIES ----------------
    const { data: rates } = useQuery({
        queryKey: ["rate", partyId],
        queryFn: () => getRates({ partyId }),
        enabled: !!partyId,
    });

    const rateList = rates?.data ?? [];

    const { data: partiesResp = {} } = useQuery({
        queryKey: ["party"],
        queryFn: allParty,
    });


    // ---------------- MUTATIONS ----------------
    const createMut = useMutation({
        mutationFn: createRate,
        onSuccess: () => {
            toast.success("Rate created!");
            queryClient.invalidateQueries(["rate"]);
            setOpenModal(false);
        },
        onError: () => toast.error("Failed to create rate"),
    });

    const AddMut = useMutation({
        mutationFn: ({ id, newData }) => addRate(id, newData),
        onSuccess: () => {
            toast.success("Rate added!");
            queryClient.invalidateQueries(["rate"]);
            setOpenAddModal(false);
        },
        onError: () => toast.error("Failed to add rate"),
    });

    const editMut = useMutation({
        mutationFn: ({ id, newData }) => addRate(id, newData),
        onSuccess: () => {
            toast.success("Rate updated!");
            queryClient.invalidateQueries(["rate"]);
            setOpenEditModal(false);
        },
        onError: () => toast.error("Failed to update rate"),
    });

    const deleteItemMutation = useMutation({
        mutationFn: ({ id, data }) => deleteRateItem(id, data),
        onSuccess: () => {
            toast.success("Item deleted!");
            queryClient.invalidateQueries(["rate"]);
        }
    });


    // ---------------- HANDLERS ----------------
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.startingValue || !form.endingValue || !form.rate || !form.date) {
            return toast.error("All fields are required!");
        }

        createMut.mutate({ ...form, partyId });

        setForm({
            startingValue: "",
            endingValue: "",
            rate: "",
            date: "",
        });
    };

    const openAddForm = (rateId) => {
        setSelectedRateId(rateId);
        setAddForm({ rate: "", date: "" });
        setOpenAddModal(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();

        if (!addForm.rate || !addForm.date) {
            return toast.error("All fields are required!");
        }

        AddMut.mutate({ id: selectedRateId, newData: addForm });
    };

    const handleEdit = (rateId, itemData) => {
        setEditRateId(rateId);
        setEditItemId(itemData._id);

        setEditForm({
            rate: itemData.rate,
            date: itemData.date.split("T")[0],
        });

        setOpenEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!editForm.rate || !editForm.date) {
            return toast.error("All fields are required!");
        }

        editMut.mutate({
            id: editRateId,
            newData: {
                itemId: editItemId,
                rate: editForm.rate,
                date: editForm.date,
            }
        });
    };


    // ---------------- UI ----------------
    return (
        <div className="p-4 space-y-4">

            {/* TOP FILTER */}
            <div className="flex items-end justify-between">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Party Name</label>
                    <select
                        value={partyId}
                        onChange={(e) => setPartyId(e.target.value)}
                        className="select select-bordered w-60"
                    >
                        <option value="">Select party</option>
                        {partiesResp?.data?.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {partyId && (
                    <button
                        onClick={() => setOpenModal(true)}
                        className="border py-1.5 px-5 rounded-lg bg-primary text-base-100 font-semibold cursor-pointer"
                    >
                        Create
                    </button>
                )}
            </div>


            {/* RATE LIST */}
            <div className="space-y-3 h-[80vh] md:h-[70vh] overflow-auto scrollbar-hide">
                {rateList.map((item) => (
                    <details key={item._id} className="collapse collapse-arrow bg-base-100 border rounded-lg" name="my-accordion-det-1">
                        <summary className="collapse-title font-semibold flex justify-between">
                            <span>Range: {item.startingValue} - {item.endingValue}</span>
                            <span>Rate: {item.items[0]?.rate}</span>
                        </summary>

                        <div className="collapse-content">

                            <div className="flex justify-end mb-2">
                                <button
                                    className="border py-1 px-4 bg-base-content rounded-lg text-sm text-base-100 font-semibold cursor-pointer"
                                    onClick={() => openAddForm(item._id)}
                                >
                                    Add
                                </button>
                            </div>

                            <div className="overflow-auto border rounded-2xl">
                                <table className="table w-full text-sm rounded-lg">
                                    <thead>
                                        <tr className="bg-base-200">
                                            <th>#</th>
                                            <th className="text-center">Rate</th>
                                            <th className="text-center">Date</th>
                                            <th className="text-center">Option</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {item.items?.map((it, index) => (
                                            <tr key={it._id}>
                                                <td>{index + 1}</td>
                                                <td className="text-center">{it.rate}</td>
                                                <td className="text-center">{new Date(it.date).toLocaleDateString()}</td>

                                                <td className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(item._id, it)}
                                                        className="border py-1 px-4 bg-green-400 rounded-lg text-sm text-base-100 font-semibold cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            setOpenDeleteModal({
                                                                id: item._id,
                                                                data: { itemId: it._id }
                                                            })
                                                        }
                                                        className="border py-1 px-4 bg-red-400 rounded-lg text-sm text-base-100 font-semibold cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {item.items?.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center text-gray-500 p-3">
                                                    No rate entries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </details>
                ))}
            </div>


            {/* CREATE MODAL */}
            {openModal && (
                <dialog open className="modal">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-3">Add Rate Range</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Party Name</label>
                                <select
                                    value={partyId}
                                    onChange={(e) => setPartyId(e.target.value)}
                                    className="select select-bordered w-full"
                                    disabled
                                    required
                                >
                                    <option value="">Select party</option>
                                    {partiesResp?.data?.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Starting Value</label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={form.startingValue}
                                    onChange={(e) => setForm({ ...form, startingValue: e.target.value })}
                                    placeholder="Starting Value"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Ending Value</label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={form.endingValue}
                                    onChange={(e) => setForm({ ...form, endingValue: e.target.value })}
                                    placeholder="Ending Value"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={form.rate}
                                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                                    placeholder="Rate"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button type="button" onClick={() => setOpenModal(false)} className="btn">Cancel</button>
                                <button type="submit" className="btn btn-primary text-white">Save</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}


            {/* ADD RATE MODAL */}
            {openAddModal && (
                <dialog open className="modal">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-3">Add New Rate</h3>

                        <form onSubmit={handleAddSubmit} className="space-y-4">

                            <div>
                                <label className="text-sm font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={addForm.rate}
                                    onChange={(e) => setAddForm({ ...addForm, rate: e.target.value })}
                                    placeholder="Rate"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={addForm.date}
                                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button type="button" onClick={() => setOpenAddModal(false)} className="btn">Cancel</button>
                                <button type="submit" className="btn btn-primary text-white">Save</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}


            {/* EDIT RATE MODAL */}
            {openEditModal && (
                <dialog open className="modal">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-3">Edit Rate</h3>

                        <form onSubmit={handleEditSubmit} className="space-y-4">

                            <div>
                                <label className="text-sm font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={editForm.rate}
                                    onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button type="button" onClick={() => setOpenEditModal(false)} className="btn">Cancel</button>
                                <button type="submit" className="btn btn-primary text-white">Update</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}


            {/* DELETE MODAL */}
            {openDeleteModal.id && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-xs p-3">
                    <div className="p-6 rounded-2xl w-full max-w-md shadow-xl border border-base-300 bg-base-200">
                        <h2 className="text-2xl font-bold mb-4">Delete Rate</h2>

                        <p className="pb-5 pt-2">Are you sure you want to delete this Rate?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                className="btn btn-soft btn-sm"
                                onClick={() => setOpenDeleteModal({ id: "", data: { itemId: "" } })}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-error btn-sm"
                                onClick={() => {
                                    deleteItemMutation.mutate(openDeleteModal);
                                    setOpenDeleteModal({ id: "", data: { itemId: "" } });
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatePage;