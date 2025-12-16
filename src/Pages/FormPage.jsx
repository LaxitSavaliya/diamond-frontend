import { useState, useMemo, useEffect, useRef } from "react";
import { addDiamondLot, allParty, allShape } from "../Lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const emptyItem = () => ({
    PKTNumber: "",
    issueWeight: "",
    expectedWeight: "",
    shapeId: "",
    date: new Date().toISOString().split("T")[0],
});

const FormPage = () => {
    const queryClient = useQueryClient();
    const kapanRef = useRef(null);

    const [showTable, setShowTable] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [openKapan, setOpenKapan] = useState(false);

    const [formData, setFormData] = useState({
        partyId: "",
        kapanNumber: "",
        items: [emptyItem()],
    });

    // -------------------- Queries --------------------
    const { data: partiesResp = {}, isLoading: isPartiesLoading } = useQuery({
        queryKey: ["party"],
        queryFn: allParty,
    });

    const { data: shapesResp = {}, isLoading: isShapesLoading } = useQuery({
        queryKey: ["shape"],
        queryFn: allShape,
    });

    // -------------------- Mutation --------------------
    const createDiamondLotMutation = useMutation({
        mutationFn: addDiamondLot,
        onSuccess: (data) => {
            setResponseData(data);
            setShowTable(true);
            toast.success("Diamond Lot added Successfully");

            queryClient.invalidateQueries({ queryKey: ["DiamondLot"] });
            queryClient.invalidateQueries({ queryKey: ["party"] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error.message);
        },
    });

    // -------------------- Helpers --------------------
    const updateField = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

    const addItem = () =>
        setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

    const removeItem = (index) =>
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));

    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const items = prev.items.map((it, i) => (i === index ? { ...it, [field]: value } : it));
            return { ...prev, items };
        });
    };

    const validateItems = (items) =>
        Array.isArray(items) &&
        items.length > 0 &&
        items.every((it) => it.PKTNumber && it.issueWeight && it.expectedWeight && it.shapeId && it.date);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.partyId || !formData.kapanNumber)
            return toast.error("Party & Kapan are required");
        if (!validateItems(formData.items)) return toast.error("All items fields are required");

        createDiamondLotMutation.mutate(formData);
    };

    const handleBack = () => {
        setShowTable(false);
        setResponseData(null);
        setFormData({ partyId: "", kapanNumber: "", items: [emptyItem()] });
    };

    // -------------------- Kapan Dropdown --------------------
    const selectedParty = useMemo(
        () => partiesResp?.data?.find((p) => p._id === formData.partyId),
        [formData.partyId, partiesResp]
    );

    const kapanList = selectedParty?.kapanNumbers || [];

    useEffect(() => {
        function handleClickOutside(e) {
            if (kapanRef.current && !kapanRef.current.contains(e.target)) setOpenKapan(false);
        }
        if (openKapan) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openKapan]);

    // -------------------- UI --------------------
    return (
        <div className="h-[87vh] overflow-auto md:p-4">
            {!showTable ? (
                <motion.div
                    className="rounded-xl p-6 shadow bg-base-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <h2 className="text-2xl mb-6 font-semibold">Add Diamond Lot</h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Party */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Party Name</label>
                            <select
                                value={formData.partyId}
                                onChange={(e) => updateField({ partyId: e.target.value })}
                                className="select select-bordered w-full"
                                disabled={isPartiesLoading}
                            >
                                {isPartiesLoading ? (
                                    <option>Loading...</option>
                                ) : (
                                    <>
                                        <option value="">Select party</option>
                                        {partiesResp?.data?.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Kapan */}
                        <div className="flex flex-col gap-2 w-full relative" ref={kapanRef}>
                            <label className="text-sm font-medium">Kapan Number</label>
                            <div
                                className="border border-base-300 rounded-lg px-3 py-2 bg-base-100 cursor-pointer flex justify-between items-center"
                                onClick={() => !formData.kapanNumber && kapanList.length > 0 && setOpenKapan((prev) => !prev)}
                            >
                                <input
                                    type="text"
                                    placeholder="Enter or select Kapan Number"
                                    value={formData.kapanNumber}
                                    onChange={(e) => updateField({ kapanNumber: e.target.value })}
                                    className="bg-transparent outline-none w-full"
                                    onFocus={() => kapanList.length > 0 && setOpenKapan(true)}
                                />
                                {kapanList.length > 0 && (
                                    <svg
                                        width="20"
                                        height="20"
                                        className={`transition-transform ${openKapan ? "rotate-180" : ""}`}
                                    >
                                        <path d="M6 8l4 4 4-4" stroke="currentColor" fill="none" />
                                    </svg>
                                )}
                            </div>

                            <AnimatePresence>
                                {openKapan && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 w-full bg-base-100 border border-base-300 rounded-lg shadow-md z-30 max-h-48 overflow-auto"
                                    >
                                        {kapanList.map((kn, i) => (
                                            <li
                                                key={i}
                                                className="px-3 py-2 hover:bg-primary hover:text-white cursor-pointer"
                                                onClick={() => {
                                                    updateField({ kapanNumber: kn });
                                                    setOpenKapan(false);
                                                }}
                                            >
                                                {kn}
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Items Section */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <AnimatePresence>
                                {formData.items.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="p-4 overflow-auto rounded-xl flex md:grid md:grid-cols-21 gap-4 items-end bg-base-200 border border-base-300"
                                    >
                                        {/* Date */}
                                        <div className="md:col-span-4 flex flex-col gap-1">
                                            <label className="text-sm">Date</label>
                                            <input
                                                type="date"
                                                value={item.date}
                                                onChange={(e) => handleItemChange(idx, "date", e.target.value)}
                                                className="input input-bordered w-40 md:w-full"
                                            />
                                        </div>

                                        {/* PKT */}
                                        <div className="md:col-span-4 flex flex-col gap-1">
                                            <label className="text-sm">PKT Number</label>
                                            <input
                                                type="text"
                                                value={item.PKTNumber}
                                                onChange={(e) => handleItemChange(idx, "PKTNumber", e.target.value)}
                                                className="input input-bordered w-40 md:w-full"
                                                placeholder="PKT"
                                            />
                                        </div>

                                        {/* Issue Weight */}
                                        <div className="md:col-span-4 flex flex-col gap-1">
                                            <label className="text-sm">Issue Weight</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.issueWeight}
                                                onChange={(e) => handleItemChange(idx, "issueWeight", e.target.value)}
                                                className="input input-bordered w-40 md:w-full"
                                                placeholder="Issue wt"
                                            />
                                        </div>

                                        {/* Expected Weight */}
                                        <div className="md:col-span-4 flex flex-col gap-1">
                                            <label className="text-sm">Expected Weight</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.expectedWeight}
                                                onChange={(e) => handleItemChange(idx, "expectedWeight", e.target.value)}
                                                className="input input-bordered w-40 md:w-full"
                                                placeholder="Expected wt"
                                            />
                                        </div>

                                        {/* Shape */}
                                        <div className="md:col-span-4 flex flex-col gap-1">
                                            <label className="text-sm">Shape</label>
                                            <select
                                                value={item.shapeId}
                                                onChange={(e) => handleItemChange(idx, "shapeId", e.target.value)}
                                                className="select select-bordered w-40 md:w-full"
                                                disabled={isShapesLoading}
                                            >
                                                {isShapesLoading ? (
                                                    <option>Loading...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select Shape</option>
                                                        {shapesResp?.data?.map((s) => (
                                                            <option key={s._id} value={s._id}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {/* Remove */}
                                        <div className="flex md:justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                disabled={formData.items.length === 1}
                                                className={`btn bg-primary text-base-300 hover:opacity-90 btn-sm ${formData.items.length === 1 ? "cursor-not-allowed" : ""
                                                    }`}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <div className="flex flex-col md:flex-row gap-3 items-center">
                                <button type="button" onClick={addItem} className="btn btn-primary flex items-center gap-2">
                                    <Plus size={16} /> Add Item
                                </button>
                                <span className="text-sm text-base-content">
                                    You can add multiple items. All fields are required.
                                </span>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                            <button
                                type="submit"
                                className={`btn btn-primary w-full md:w-auto`}
                                aria-disabled={createDiamondLotMutation.isPending}
                            >
                                {createDiamondLotMutation.isPending ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                // -------------------- Table --------------------
                <motion.div
                    className="rounded-xl p-4 shadow bg-base-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Diamond Lot List</h3>
                        <button className="btn btn-outline btn-primary btn-sm" onClick={handleBack}>
                            Back
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-base-300">
                        <table className="table table-zebra w-full">
                            <thead className="bg-base-300">
                                <tr>
                                    <th>#</th>
                                    <th>Party</th>
                                    <th>Date</th>
                                    <th>UniqueId</th>
                                    <th>Kapan</th>
                                    <th>PKT</th>
                                    <th>Issue Wt</th>
                                    <th>Expected Wt</th>
                                    <th>Shape</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {(responseData || [])
                                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                                        .map((item, i) => (
                                            <motion.tr
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="hover:bg-base-300"
                                            >
                                                <td>{i + 1}</td>
                                                <td>{item?.partyId?.name}</td>
                                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                                <td>{item.uniqueId}</td>
                                                <td>{item.kapanNumber}</td>
                                                <td>{item.PKTNumber}</td>
                                                <td>{item.issueWeight}</td>
                                                <td>{item.expectedWeight}</td>
                                                <td>{item.shapeId?.name}</td>
                                            </motion.tr>
                                        ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default FormPage;