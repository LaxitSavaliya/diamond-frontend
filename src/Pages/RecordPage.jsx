import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { diamondLot } from "../Lib/api";

const RecordPage = () => {
    const [uniqueId, setUniqueId] = useState("");

    const { data: diamond, refetch } = useQuery({
        queryKey: ["diamond"],
        queryFn: () => diamondLot({ uniqueId }),
        enabled: false,
    });

    const lot = diamond?.data;

    const handleDataGet = () => {
        if (uniqueId) refetch();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleDataGet();
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-66px)] md:h-[calc(100vh-100px)] overflow-auto">
            {/* Search */}
            <div className="flex items-end gap-4 mb-6">
                <div className="flex flex-col gap-1 w-60">
                    <label className="text-sm font-medium">Unique ID</label>
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="Enter Unique ID"
                        value={uniqueId}
                        onChange={(e) => setUniqueId(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <button onClick={handleDataGet} className="btn btn-primary w-auto">
                    GET
                </button>
            </div>

            {/* Card */}
            {lot && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="card bg-base-100 shadow-xl p-4 md:p-6 border space-y-6"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b pb-4">
                        <h2 className="text-xl md:text-2xl font-bold">
                            Diamond Lot — KD-{lot.uniqueId}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Date: {lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : "-"}
                        </p>
                    </div>

                    {/* 3 Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Basic Info */}
                        <InfoCard title="Basic Info">
                            <Field label="Party" value={lot.partyId?.name} />
                            <Field label="Shape" value={lot.shapeId?.name} />
                            <Field label="Color" value={lot.colorId?.name} />
                            <Field label="Clarity" value={lot.clarityId?.name} />
                        </InfoCard>

                        {/* Lot Details */}
                        <InfoCard title="Lot Details">
                            <Field label="Kapan Number" value={lot.kapanNumber} />
                            <Field label="PKT Number" value={lot.PKTNumber} />
                            <Field label="Status" value={lot.statusId?.name} />
                            <Field label="Remark" value={lot.remark} />
                        </InfoCard>

                        {/* Financial */}
                        <InfoCard title="Financial">
                            <Field label="Rate" value={lot.rate && `${lot.rate} ₹`} />
                            <Field label="Amount" value={lot.amount && `${lot.amount} ₹`} />
                            <Field label="Created" value={lot.createdAt && new Date(lot.createdAt).toLocaleDateString()} />
                            <Field label="Updated" value={lot.updatedAt && new Date(lot.updatedAt).toLocaleDateString()} />
                        </InfoCard>
                    </div>

                    {/* Weight Summary */}
                    <div className="p-4 rounded-xl shadow-md border">
                        <h3 className="font-semibold mb-4">Weight Summary</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <Field label="Issue Wt" value={`${lot.issueWeight} ct`} />
                            <Field label="Expected Wt" value={`${lot.expectedWeight} ct`} />
                            <Field label="Polish Wt" value={lot.polishWeight ? `${lot.polishWeight} ct` : "-"} />
                            <Field label="HPHT Wt" value={lot.HPHTWeight ? `${lot.HPHTWeight} ct` : "-"} />
                            <Field label="Polish Date" value={lot.polishDate ? new Date(lot.polishDate).toLocaleDateString() : "-"} />
                            <Field label="HPHT Date" value={lot.HPHTDate ? new Date(lot.HPHTDate).toLocaleDateString() : "-"} />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default RecordPage;

/* ------------------------- COMPONENTS ------------------------- */

const InfoCard = ({ title, children }) => (
    <div className="p-4 rounded-xl shadow-md border bg-base-100 space-y-2">
        <h3 className="font-semibold mb-2">{title}</h3>
        {children}
    </div>
);

const Field = ({ label, value }) => (
    <p className="flex justify-between text-sm">
        <span className="font-medium text-gray-500">{label}:</span>
        <span className="font-medium">{value || "-"}</span>
    </p>
);