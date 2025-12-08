import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allClarity, allColor, allParty, allPaymentStatus, allShape, allStatus, diamondData, updateDiamondLot } from "../Lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowDownUp, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useFilter } from "../Context/filterContext";
import { motion, AnimatePresence } from "framer-motion";

const DiamondTable = ({ showTotal, showIcon }) => {

    const queryClient = useQueryClient();

    const {
        record,
        partyId,
        statusId,
        paymentStatusId,
        search,
        startDate,
        kapanNumber,
        endDate,
    } = useFilter();

    const [searchTerm, setSearchTerm] = useState("");

    const [page, setPage] = useState(1);

    const inputRef = useRef(null);

    const [sortData, setSortData] = useState({
        uniqueIdReverse: "asc",
        dateReverse: "default",
        polishDateReverse: "default",
        HPHTDateReverse: "default"
    });

    const Disabled =
        (sortData.uniqueIdReverse === "asc" || sortData.uniqueIdReverse === "desc") &&
        sortData.dateReverse === "default";

    useEffect(() => {
        const timeout = setTimeout(() => setSearchTerm(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const { data: diamond, isLoading: diamondLoading } = useQuery({
        queryKey: ["diamond", sortData, page, record, kapanNumber, paymentStatusId, statusId, partyId, searchTerm, startDate, endDate],
        queryFn: () =>
            diamondData({
                uniqueIdReverse: sortData.uniqueIdReverse,
                dateReverse: sortData.dateReverse,
                polishDateReverse: sortData.polishDateReverse,
                HPHTDateReverse: sortData.HPHTDateReverse,
                page,
                record,
                partyId: JSON.stringify(partyId),
                statusId: JSON.stringify(statusId),
                paymentStatusId: JSON.stringify(paymentStatusId),
                kapanNumber: JSON.stringify(kapanNumber),
                search: searchTerm,
                startDate,
                endDate,
            }),
        keepPreviousData: true,
    });

    if (diamond?.data.length === 0) {
        showIcon();
    }

    const { data: partiesResp = {}, isLoading: partiesLoading } = useQuery({
        queryKey: ["party"],
        queryFn: allParty,
    });

    const { data: shapesResp = {}, isLoading: shapesLoading } = useQuery({
        queryKey: ["shape"],
        queryFn: allShape,
    });

    const { data: colorResp = {}, isLoading: colorsLoading } = useQuery({
        queryKey: ["color"],
        queryFn: allColor,
    });

    const { data: clarityResp = {}, isLoading: clariteisLoading } = useQuery({
        queryKey: ["clarity"],
        queryFn: allClarity,
    });

    const { data: statusResp = {}, isLoading: statusLoading } = useQuery({
        queryKey: ["status"],
        queryFn: allStatus,
    });

    const { data: paymentStatusResp = {}, isLoading: paymentStatusLoading } = useQuery({
        queryKey: ["paymentStatus"],
        queryFn: allPaymentStatus,
    });

    const partyOptions = useMemo(() => (
        partiesResp?.data?.map((p) => ({ value: p._id, label: p.name })) || []
    ), [partiesResp]);

    const shapeOptions = useMemo(() => (
        shapesResp?.data?.map((s) => ({ value: s._id, label: s.name })) || []
    ), [shapesResp]);

    const colorOptions = useMemo(() => (
        colorResp?.data?.map((s) => ({ value: s._id, label: s.name })) || []
    ), [colorResp]);

    const clarityOptions = useMemo(() => (
        clarityResp?.data?.map((s) => ({ value: s._id, label: s.name })) || []
    ), [clarityResp]);

    const statusOptions = useMemo(() => (
        statusResp?.data?.map((s) => ({ value: s._id, label: s.name })) || []
    ), [statusResp]);

    const paymentStatusOptions = useMemo(() => (
        paymentStatusResp?.data?.map((s) => ({ value: s._id, label: s.name })) || []
    ), [paymentStatusResp]);

    const DATE_FIELDS = ["polishDate", "HPHTDate", "date"];

    const [boxValue, setBoxValue] = useState({
        id: "",
        field: "",
        currentValue: "",
    });

    const handleDoubleClick = (id, field, currentValue) => {
        let formattedValue = currentValue;

        if (DATE_FIELDS.includes(field) && currentValue) {
            formattedValue = new Date(currentValue).toISOString().split("T")[0];
        }

        setBoxValue({
            id,
            field,
            currentValue: formattedValue,
        });
    };

    const updateDiamondMutation = useMutation({
        mutationFn: ({ id, newData }) => updateDiamondLot(id, newData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["diamond"], exact: false });
        }
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && boxValue.id && boxValue.field) {
                updateDiamondMutation.mutate({
                    id: boxValue.id,
                    newData: { [boxValue.field]: boxValue.currentValue },
                }, {
                    onSuccess: () => toast.success('Update Successfully'),
                    onError: (error) => toast.error(error.response?.data?.message || error.message)
                });

                setBoxValue({
                    id: "",
                    field: "",
                    currentValue: "",
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [boxValue]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setBoxValue({
                    id: "",
                    field: "",
                    currentValue: "",
                });
            }
        }

        if (boxValue) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [boxValue]);

    const handleSort = (field, value) => {
        if (value === "default") {
            if (sortData.field === "default") {
                return
            } else {
                setSortData({
                    uniqueIdReverse: "asc",
                    dateReverse: "default",
                    polishDateReverse: "default",
                    HPHTDateReverse: "default"
                })
            }
        } else {
            setSortData(prev => {
                const newSort = {};
                for (const key in prev) {
                    newSort[key] = key === field ? value : "default";
                }
                return newSort;
            });
        }
    }

    const skeletonRows = Array.from({ length: 10 }, (_, i) => i);


    return (
        <div className="h-full flex flex-col justify-between p-2 md:p-0">

            {diamond?.data.length === 0 ? (
                <div className="h-full flex justify-center items-center">Data NOT founde.</div>
            ) : (
                <>
                    <div>
                        <div className={`grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3 mb-4 ${showTotal ? "" : "hidden"}`}>
                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-semibold">Count</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalItems}</span>
                            </div>

                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-medium text-nowrap">Issue WT</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalIssueWeight} ({(diamond?.totalIssueWeight / diamond?.totalItems).toFixed(2)})</span>
                            </div>

                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-medium text-nowrap">Polish WT</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalPolishWeight} ({(diamond?.totalPolishWeight / diamond?.totalItems).toFixed(2)})</span>
                            </div>

                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-medium text-nowrap">Expected WT</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalExpectedWeight} ({(diamond?.totalExpectedWeight / diamond?.totalItems).toFixed(2)})</span>
                            </div>

                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-medium text-nowrap">HPHT WT</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalHphtWeight} ({(diamond?.totalExpectedWeight / diamond?.totalItems).toFixed(2)})</span>
                            </div>

                            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                                <span className="text-xs text-slate-500 font-medium text-nowrap">Total Amount</span>
                                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalAmount} ({(diamond?.totalAmount / diamond?.totalItems).toFixed(2)})</span>
                            </div>
                        </div>
                        <div className={`${showTotal ? "max-h-[70vh] md:max-h-[70vh]" : "max-h-[85vh] md:max-h-[81vh]"} overflow-auto rounded-xl shadow-md border border-gray-300`}>
                            <table className="w-full table table-zebra text-sm">
                                <thead className="sticky top-0 z-10 bg-base-content text-base-100">
                                    <tr className="text-center">
                                        <th className="p-2">#</th>
                                        <th className="p-2">Party</th>

                                        {/* ---- DATE SORT ---- */}
                                        <th className="p-2 select-none">
                                            <div className="flex items-center justify-center gap-2">
                                                Date
                                                {sortData.dateReverse === "asc" ? (
                                                    <ArrowDown className="size-5 cursor-pointer" onClick={() => handleSort("dateReverse", "desc")} />
                                                ) : (
                                                    sortData.dateReverse === "desc" ? (
                                                        <ArrowUp className="size-5 cursor-pointer" onClick={() => handleSort("dateReverse", "asc")} />
                                                    ) : (
                                                        <ArrowDownUp className="size-5 cursor-pointer" onClick={() => handleSort("dateReverse", "asc")} />
                                                    )
                                                )}
                                            </div>
                                        </th>

                                        <th className="p-2 select-none">
                                            <div className="flex items-center justify-center gap-2">
                                                Unique ID
                                                {sortData.uniqueIdReverse === "asc" ? (
                                                    <ArrowDown className="size-5 cursor-pointer" onClick={() => handleSort("uniqueIdReverse", "desc")} />
                                                ) : (
                                                    sortData.uniqueIdReverse === "desc" ? (
                                                        <ArrowUp className="size-5 cursor-pointer" onClick={() => handleSort("uniqueIdReverse", "asc")} />
                                                    ) : (
                                                        <ArrowDownUp className="size-5 cursor-pointer" onClick={() => handleSort("uniqueIdReverse", "asc")} />
                                                    )
                                                )}
                                            </div>
                                        </th>

                                        <th className="p-2">Kapan</th>
                                        <th className="p-2">PKT</th>
                                        <th className="p-2">Issue Wt</th>
                                        <th className="p-2">Expected Wt</th>
                                        <th className="p-3">Shape</th>
                                        <th className="p-2">Polish Wt</th>
                                        <th className="p-2">Color</th>
                                        <th className="p-2">Clarity</th>

                                        <th className="p-2 select-none">
                                            <div className="flex items-center justify-center gap-2">
                                                Polish Date
                                                {sortData.polishDateReverse === "asc" ? (
                                                    <ArrowDown className="size-5 cursor-pointer" onClick={() => handleSort("polishDateReverse", "desc")} />
                                                ) : (
                                                    sortData.polishDateReverse === "desc" ? (
                                                        <ArrowUp className="size-5 cursor-pointer" onClick={() => handleSort("polishDateReverse", "asc")} />
                                                    ) : (
                                                        <ArrowDownUp className="size-5 cursor-pointer" onClick={() => handleSort("polishDateReverse", "asc")} />
                                                    )
                                                )}
                                            </div>
                                        </th>
                                        <th className="p-2">Rate</th>
                                        <th className="p-2">Amount</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">HPHT Wt</th>

                                        <th className="p-2 select-none">
                                            <div className="flex items-center justify-center gap-2">
                                                HPHT Date
                                                {sortData.HPHTDateReverse === "asc" ? (
                                                    <ArrowDown className="size-5 cursor-pointer" onClick={() => handleSort("HPHTDateReverse", "desc")} />
                                                ) : (
                                                    sortData.HPHTDateReverse === "desc" ? (
                                                        <ArrowUp className="size-5 cursor-pointer" onClick={() => handleSort("HPHTDateReverse", "asc")} />
                                                    ) : (
                                                        <ArrowDownUp className="size-5 cursor-pointer" onClick={() => handleSort("HPHTDateReverse", "asc")} />
                                                    )
                                                )}
                                            </div>
                                        </th>
                                        <th className="p-2">Payment</th>
                                        <th className="p-2">Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diamondLoading
                                        ? (
                                            skeletonRows.map((i) => (
                                                <tr key={i} className="animate-pulse text-center text-[13px]">
                                                    {Array.from({ length: 20 }).map((_, j) => (
                                                        <td key={j} className="px-2 py-3.5">
                                                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            diamond?.data || []).map((item, index) => (
                                                <motion.tr
                                                    key={item._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                        duration: 0.25,
                                                        delay: index * 0.07,
                                                        ease: "easeOut"
                                                    }}
                                                    className={`text-center text-[13px] hover:bg-base-300`}
                                                >
                                                    <td className="px-2 py-3.5 whitespace-nowrap">{(page - 1) * record + (index + 1)}</td>

                                                    {boxValue.id == item._id && boxValue.field == "partyId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="party"
                                                                    disabled={partiesLoading}
                                                                    className="select select-bordered w-50"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select party"
                                                                >
                                                                    <option value="" disabled>
                                                                        {partiesLoading ? "Loading..." : "Select party"}
                                                                    </option>

                                                                    {partyOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "partyId", item.partyId?._id)}>{item.partyId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "date"
                                                        ? (
                                                            <td><input type="date" className="border rounded-md p-1" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "date", item.date)}>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                                                        )}
                                                    <td className="px-2 py-3.5 whitespace-nowrap">KD{item.uniqueId || "-"}</td>
                                                    {boxValue.id == item._id && boxValue.field == "kapanNumber"
                                                        ? (
                                                            <td><input type="text" className="border rounded-md p-1 w-35" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "kapanNumber", item.kapanNumber)}>{item.kapanNumber || "-"}</td>
                                                        )}
                                                    {boxValue.id == item._id && boxValue.field == "PKTNumber"
                                                        ? (
                                                            <td><input type="text" className="border rounded-md p-1 w-35" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "PKTNumber", item.PKTNumber)}>{item.PKTNumber || "-"}</td>
                                                        )}
                                                    {boxValue.id == item._id && boxValue.field == "issueWeight"
                                                        ? (
                                                            <td><input type="number" className="border rounded-md p-1 w-18" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "issueWeight", item.issueWeight)}>{item.issueWeight || "-"}</td>
                                                        )}
                                                    {boxValue.id == item._id && boxValue.field == "expectedWeight"
                                                        ? (
                                                            <td><input type="number" className="border rounded-md p-1 w-18" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "expectedWeight", item.expectedWeight)}>{item.expectedWeight || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "shapeId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="shape"
                                                                    disabled={shapesLoading}
                                                                    className="select select-bordered w-30"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select shape"
                                                                >
                                                                    <option value="" disabled>
                                                                        {shapesLoading ? "Loading..." : "Select shape"}
                                                                    </option>

                                                                    {shapeOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "shapeId", item.shapeId?._id)}>{item.shapeId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "polishWeight"
                                                        ? (
                                                            <td><input type="number" className="border rounded-md p-1 w-18" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "polishWeight", item.polishWeight)}>{item.polishWeight || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "colorId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="color"
                                                                    disabled={colorsLoading}
                                                                    className="select select-bordered w-30"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select color"
                                                                >
                                                                    <option value="" disabled>
                                                                        {colorsLoading ? "Loading..." : "Select color"}
                                                                    </option>

                                                                    {colorOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "colorId", item.colorId?._id)}>{item.colorId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "clarityId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="clarity"
                                                                    disabled={clariteisLoading}
                                                                    className="select select-bordered w-30"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select clarity"
                                                                >
                                                                    <option value="" disabled>
                                                                        {clariteisLoading ? "Loading..." : "Select clarity"}
                                                                    </option>

                                                                    {clarityOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "clarityId", item.clarityId?._id)}>{item.clarityId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "polishDate"
                                                        ? (
                                                            <td><input type="date" className="border rounded-md p-1" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "polishDate", item.polishDate)}>{item.polishDate ? new Date(item.polishDate).toLocaleDateString() : "-"}</td>
                                                        )}

                                                    <td className="px-2 py-3.5 whitespace-nowrap">{item.rate || "-"}</td>
                                                    <td className="px-2 py-3.5 whitespace-nowrap">
                                                        {item.amount != null ? item.amount.toFixed(2) : "-"}
                                                    </td>

                                                    {boxValue.id == item._id && boxValue.field == "statusId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="status"
                                                                    disabled={statusLoading}
                                                                    className="select select-bordered w-30"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select status"
                                                                >
                                                                    <option value="" disabled>
                                                                        {statusLoading ? "Loading..." : "Select status"}
                                                                    </option>

                                                                    {statusOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "statusId", item.statusId?._id)}>{item.statusId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "HPHTWeight"
                                                        ? (
                                                            <td><input type="number" className="border rounded-md p-1 w-18" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "HPHTWeight", item.HPHTWeight)}>{item.HPHTWeight || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "HPHTDate"
                                                        ? (
                                                            <td><input type="date" className="border rounded-md p-1" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "HPHTDate", item.HPHTDate)}>{item.HPHTDate ? new Date(item.HPHTDate).toLocaleDateString() : "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "paymentStatusId"
                                                        ? (
                                                            <td>
                                                                <select
                                                                    id="paymentStatus"
                                                                    disabled={paymentStatusLoading}
                                                                    className="select select-bordered w-30"
                                                                    value={boxValue.currentValue || ""}
                                                                    onChange={(e) =>
                                                                        setBoxValue({ ...boxValue, currentValue: e.target.value })
                                                                    }
                                                                    ref={inputRef}
                                                                    aria-label="Select payment status"
                                                                >
                                                                    <option value="" disabled>
                                                                        {paymentStatusLoading ? "Loading..." : "Select payment status"}
                                                                    </option>

                                                                    {paymentStatusOptions.map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "paymentStatusId", item.paymentStatusId?._id)}>{item.paymentStatusId?.name || "-"}</td>
                                                        )}

                                                    {boxValue.id == item._id && boxValue.field == "remark"
                                                        ? (
                                                            <td><input type="text" className="border rounded-md p-1" ref={inputRef} value={boxValue.currentValue} onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })} /></td>
                                                        )
                                                        : (
                                                            <td className="px-2 py-3.5 whitespace-nowrap" onDoubleClick={() => handleDoubleClick(item._id, "remark", item.remark)}>{item.remark || "-"}</td>
                                                        )}
                                                </motion.tr>
                                            )
                                            )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={`flex justify-center gap-5 bg-opacity-80 backdrop-blur-md`}>
                        <ChevronLeft className="cursor-pointer size-7 p-0.5 rounded-full border hover:bg-primary hover:text-base-100"
                            onClick={() => {
                                if (page > 1) setPage(prev => Math.max(1, prev - 1))
                            }}
                        />
                        <span>{page} / {diamond?.totalPages}</span>
                        <ChevronRight
                            className="cursor-pointer size-7 p-0.5 rounded-full border hover:bg-primary hover:text-base-100"
                            onClick={() => {
                                if (page < diamond?.totalPages) setPage(prev => prev < diamond?.totalPages ? prev + 1 : prev);
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default DiamondTable;