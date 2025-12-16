import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allClarity, allColor, allParty, allPaymentStatus, allShape, allStatus, diamondData, updateDiamondLot } from "../Lib/api";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ArrowDown, ArrowDownUp, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useFilter } from "../Context/filterContext";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMasterData } from "../Hooks/useMasterData";
import Pagination from "../Components/Common/Pagination";

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

    // helper utils
    const safeDivide = (numer, denom, digits = 2) => {
        if (!denom || denom === 0) return "-";
        const res = Number(numer || 0) / Number(denom);
        return Number.isFinite(res) ? res.toFixed(digits) : "-";
    };

    const formatDateMaybe = (d) => (d ? new Date(d).toLocaleDateString() : "-");

    const formatNumberMaybe = (n, digits = 2) => (n != null ? Number(n).toFixed(digits) : "-");

    const TotalsGrid = ({ diamond }) => (
        <div className={`grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3 mb-4`}>
            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-semibold">Count</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalItems ?? "-"}</span>
            </div>

            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium text-nowrap">Issue WT</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalIssueWeight ?? "-"} ({safeDivide(diamond?.totalIssueWeight, diamond?.totalItems)})</span>
            </div>

            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium text-nowrap">Polish WT</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalPolishWeight ?? "-"} ({safeDivide(diamond?.totalPolishWeight, diamond?.totalItems)})</span>
            </div>

            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium text-nowrap">Expected WT</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalExpectedWeight ?? "-"} ({safeDivide(diamond?.totalExpectedWeight, diamond?.totalItems)})</span>
            </div>

            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium text-nowrap">HPHT WT</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{diamond?.totalHphtWeight ?? "-"} ({safeDivide(diamond?.totalHphtWeight, diamond?.totalItems)})</span>
            </div>

            <div className="bg-base-100 p-2 rounded-lg shadow-sm shadow-base-300 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium text-nowrap">Total Amount</span>
                <span className="text-xs md:text-lg font-semibold mt-1 text-nowrap">{formatNumberMaybe(diamond?.totalAmount ?? null)} ({safeDivide(diamond?.totalAmount, diamond?.totalItems)})</span>
            </div>
        </div>
    );

    TotalsGrid.propTypes = {
        diamond: PropTypes.object,
    };

    const EditableCell = ({ item, field, displayValue, type = "text", options = [], loading = false, className = "px-2 py-3.5 whitespace-nowrap" }) => {
        const isEditing = boxValue.id == item._id && boxValue.field == field;

        if (isEditing) {
            if (type === "select") {
                return (
                    <td>
                        <select
                            id={field}
                            disabled={loading}
                            className="select select-bordered w-30"
                            value={boxValue.currentValue || ""}
                            onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })}
                            ref={inputRef}
                            aria-label={`Select ${field}`}
                        >
                            <option value="" disabled>{loading ? "Loading..." : `Select ${field}`}</option>
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </td>
                );
            }

            const inputType = type === "number" ? "number" : (type === "date" ? "date" : "text");

            return (
                <td>
                    <input
                        type={inputType}
                        className="border rounded-md p-1"
                        ref={inputRef}
                        value={boxValue.currentValue}
                        onChange={(e) => setBoxValue({ ...boxValue, currentValue: e.target.value })}
                    />
                </td>
            );
        }

        return (
            <td className={className} onDoubleClick={() => handleDoubleClick(item._id, field, (type === "date" ? item[field] : (type === "select" ? (item[field]?._id || item[field]) : item[field])))} >
                {displayValue}
            </td>
        );
    };

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


    const {
        parties,
        shapes,
        colors,
        clarities,
        statuses,
        paymentStatuses,
        isLoading
    } = useMasterData();

    const toOptions = (query) =>
        query?.data?.map((i) => ({
            value: i._id,
            label: i.name,
        })) || [];

    const partyOptions = useMemo(() => toOptions(parties), [parties]);
    const shapeOptions = useMemo(() => toOptions(shapes), [shapes]);
    const colorOptions = useMemo(() => toOptions(colors), [colors]);
    const clarityOptions = useMemo(() => toOptions(clarities), [clarities]);
    const statusOptions = useMemo(() => toOptions(statuses), [statuses]);
    const paymentStatusOptions = useMemo(
        () => toOptions(paymentStatuses),
        [paymentStatuses]
    );

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
                    onError: (error) => toast.error(error.response?.data?.message || error.message),
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

        if (boxValue?.id) {
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

    const formatDiamondData = useCallback((data) => {
        return (data || []).map((item, index) => ({
            "NO": index + 1,
            Party: item.partyId?.name || "-",
            Date: item.date ? new Date(item.date).toLocaleDateString() : "-",
            "Unique ID": `KD${item.uniqueId || "-"}`,
            Kapan: item.kapanNumber || "-",
            PKT: item.PKTNumber || "-",
            "Issue Wt": item.issueWeight || "-",
            "Expected Wt": item.expectedWeight || "-",
            Shape: item.shapeId?.name || "-",
            "Polish Wt": item.polishWeight || "-",
            Color: item.colorId?.name || "-",
            Clarity: item.clarityId?.name || "-",
            "Polish Date": item.polishDate ? new Date(item.polishDate).toLocaleDateString() : "-",
            Rate: item.rate || "-",
            Amount: item.amount?.toFixed(2) || "-",
            Status: item.statusId?.name || "-",
            "HPHT Wt": item.HPHTWeight || "-",
            "HPHT Date": item.HPHTDate ? new Date(item.HPHTDate).toLocaleDateString() : "-",
            Payment: item.paymentStatusId?.name || "-",
            Remark: item.remark || "-",
        }));
    }, []);

    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
    // Export modal & selection state
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFields, setExportFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [exportRows, setExportRows] = useState([]);
    const [exportMeta, setExportMeta] = useState(null);
    const modalFirstCheckboxRef = useRef(null);

    const buildExportRows = (items) => {
        // Use the same formatter so UI and exports match
        return formatDiamondData(items || []);
    };

    const fetchExportRows = useCallback(async () => {
        const recordCount = diamond?.totalItems || 10000;
        const resp = await diamondData({
            uniqueIdReverse: sortData.uniqueIdReverse,
            dateReverse: sortData.dateReverse,
            polishDateReverse: sortData.polishDateReverse,
            HPHTDateReverse: sortData.HPHTDateReverse,
            page: 1,
            record: recordCount,
            partyId: JSON.stringify(partyId),
            statusId: JSON.stringify(statusId),
            paymentStatusId: JSON.stringify(paymentStatusId),
            kapanNumber: JSON.stringify(kapanNumber),
            search: searchTerm,
            startDate,
            endDate,
        });

        const rows = buildExportRows(resp?.data || []);
        setExportMeta(resp || null);
        return rows;
    }, [diamond, sortData, partyId, statusId, paymentStatusId, kapanNumber, searchTerm, startDate, endDate, buildExportRows]);

    const openExportModal = useCallback(async () => {
        setExportModalOpen(true);
        setFieldsLoading(true);
        try {
            const rows = await fetchExportRows();
            setExportRows(rows);
            if (rows && rows.length > 0) {
                const fields = Object.keys(rows[0]);
                setExportFields(fields);
                setSelectedFields(fields.slice()); // default: all selected
            } else {
                setExportFields([]);
                setSelectedFields([]);
            }
        } catch (error) {
            console.error("Failed to fetch fields for export:", error);
            setExportFields([]);
            setSelectedFields([]);
        } finally {
            setFieldsLoading(false);
        }
    }, [fetchExportRows]);

    const closeExportModal = useCallback(() => {
        setExportModalOpen(false);
        // don't clear selections so user can re-open with same choices
    }, []);

    const toggleField = useCallback((field) => {
        setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));
    }, []);

    const selectAllFields = useCallback(() => setSelectedFields(exportFields.slice()), [exportFields]);
    const clearAllFields = useCallback(() => setSelectedFields([]), []);

    // Clear cached export rows/fields when table filters/sort change so modal reflects latest data
    useEffect(() => {
        setExportRows([]);
        setExportFields([]);
        // don't clear selectedFields so user doesn't lose manual choices
    }, [sortData, partyId, statusId, paymentStatusId, kapanNumber, searchTerm, startDate, endDate]);

    // Focus first checkbox when modal opens (accessibility)
    useEffect(() => {
        if (exportModalOpen && modalFirstCheckboxRef.current) {
            modalFirstCheckboxRef.current.focus();
        }

        function onKey(e) {
            if (e.key === 'Escape') closeExportModal();
        }

        if (exportModalOpen) {
            window.addEventListener('keydown', onKey);
        }

        return () => window.removeEventListener('keydown', onKey);
    }, [exportModalOpen, closeExportModal]);

    const exportToExcel = useCallback((rowsToExport, keys) => {
        const filtered = rowsToExport.map((r) => keys.reduce((acc, k) => ({ ...acc, [k]: r[k] }), {}));
        const worksheet = XLSX.utils.json_to_sheet(filtered);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Diamonds");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const filename = `Diamond_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;
        saveAs(file, filename);
    }, []);

    const exportToPDF = useCallback((rowsToExport, keys) => {
        const doc = new jsPDF("l", "pt", "a4");
        const head = [keys];
        const body = rowsToExport.map((r) => keys.map((k) => r[k]));

        doc.setFontSize(14);
        doc.text("Diamond Report", 40, 30);

        autoTable(doc, {
            head,
            body,
            startY: 50,
            styles: {
                fontSize: 8,
                cellPadding: 4,
                overflow: "linebreak",
            },
            headStyles: {
                fillColor: [30, 41, 59],
                textColor: 255,
                halign: "center",
            },
            bodyStyles: {
                halign: "center",
            },
            theme: "grid",
            margin: { left: 20, right: 20 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(9);
                doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth() - 100, doc.internal.pageSize.getHeight() - 10);
            }
        });

        const filename = `Diamond_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
        doc.save(filename);
    }, []);

    const handleModalDownload = useCallback(async (type) => {
        if (!selectedFields || selectedFields.length === 0) {
            toast.error("Please select at least one field to export");
            return;
        }

        try {
            let rows = exportRows;
            if (!rows || rows.length === 0) {
                setFieldsLoading(true);
                rows = await fetchExportRows();
                setExportRows(rows);
            }

            if (!rows || rows.length === 0) {
                toast.error("No data available to export");
                return;
            }

            const orderedSelected = exportFields.filter((f) => selectedFields.includes(f));
            // Build filtered rows only with selected fields, preserving order
            const filtered = rows.map((r) => orderedSelected.reduce((acc, k) => ({ ...acc, [k]: r[k] }), {}));

            // If meta contains totals, append Totals and Average rows when relevant fields are selected
            const totalsMap = {
                'NO': exportMeta?.totalItems,
                'Issue Wt': exportMeta?.totalIssueWeight,
                'Polish Wt': exportMeta?.totalPolishWeight,
                'Expected Wt': exportMeta?.totalExpectedWeight,
                'HPHT Wt': exportMeta?.totalHphtWeight,
                'Amount': exportMeta?.totalAmount,
            };

            const hasTotals = orderedSelected.some((k) => totalsMap[k] != null);
            if (hasTotals) {
                const labelCol = orderedSelected.includes('Remark') ? 'Remark' : orderedSelected[0];

                const totalsRow = {};
                totalsRow[labelCol] = 'Totals';
                orderedSelected.forEach((k) => {
                    const val = totalsMap[k];
                    if (val != null) {
                        totalsRow[k] = k === 'Amount' ? Number(val).toFixed(2) : val;
                    } else if (totalsRow[k] === undefined) {
                        totalsRow[k] = '';
                    }
                });

                filtered.push(totalsRow);
            }

            if (type === 'excel') {
                setIsDownloadingExcel(true);
                exportToExcel(filtered, orderedSelected);
                toast.success("Excel exported successfully");
            } else {
                setIsDownloadingPDF(true);
                exportToPDF(filtered, orderedSelected);
                toast.success("PDF exported successfully");
            }

            closeExportModal();
        } catch (error) {
            console.error("Export failed:", error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to export");
        } finally {
            setIsDownloadingExcel(false);
            setIsDownloadingPDF(false);
            setFieldsLoading(false);
        }
    }, [selectedFields, exportRows, exportToExcel, exportToPDF, fetchExportRows, closeExportModal, exportFields]);

    // Existing direct-download functions remain (but unused) for backward-compatibility
    const downloadExcel = useCallback(async () => {
        try {
            setIsDownloadingExcel(true);

            // Fetch all filtered data for export (use totalItems if available)
            const recordCount = diamond?.totalItems || 10000;
            const resp = await diamondData({
                uniqueIdReverse: sortData.uniqueIdReverse,
                dateReverse: sortData.dateReverse,
                polishDateReverse: sortData.polishDateReverse,
                HPHTDateReverse: sortData.HPHTDateReverse,
                page: 1,
                record: recordCount,
                partyId: JSON.stringify(partyId),
                statusId: JSON.stringify(statusId),
                paymentStatusId: JSON.stringify(paymentStatusId),
                kapanNumber: JSON.stringify(kapanNumber),
                search: searchTerm,
                startDate,
                endDate,
            });

            const rows = buildExportRows(resp?.data || []);

            if (!rows || rows.length === 0) {
                toast.error("No data available to export");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Diamonds");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const file = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const filename = `Diamond_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;
            saveAs(file, filename);
            toast.success("Excel exported successfully");
        } catch (error) {
            console.error("Excel export failed:", error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to export Excel");
        } finally {
            setIsDownloadingExcel(false);
        }
    }, [diamond, sortData, partyId, statusId, paymentStatusId, kapanNumber, searchTerm, startDate, endDate]);

    const downloadPDF = useCallback(async () => {
        try {
            setIsDownloadingPDF(true);

            const recordCount = diamond?.totalItems || 10000;
            const resp = await diamondData({
                uniqueIdReverse: sortData.uniqueIdReverse,
                dateReverse: sortData.dateReverse,
                polishDateReverse: sortData.polishDateReverse,
                HPHTDateReverse: sortData.HPHTDateReverse,
                page: 1,
                record: recordCount,
                partyId: JSON.stringify(partyId),
                statusId: JSON.stringify(statusId),
                paymentStatusId: JSON.stringify(paymentStatusId),
                kapanNumber: JSON.stringify(kapanNumber),
                search: searchTerm,
                startDate,
                endDate,
            });

            const rows = buildExportRows(resp?.data || []);

            if (!rows || rows.length === 0) {
                toast.error("No data available to export");
                return;
            }

            const doc = new jsPDF("l", "pt", "a4");
            const head = [Object.keys(rows[0])];
            const body = rows.map((obj) => Object.values(obj));

            doc.setFontSize(14);
            doc.text("Diamond Report", 40, 30);

            autoTable(doc, {
                head,
                body,
                startY: 50,
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    overflow: "linebreak",
                },
                headStyles: {
                    fillColor: [30, 41, 59],
                    textColor: 255,
                    halign: "center",
                },
                bodyStyles: {
                    halign: "center",
                },
                theme: "grid",
                margin: { left: 20, right: 20 },
                didDrawPage: (data) => {
                    // optional: page footer with page number
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(9);
                    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth() - 100, doc.internal.pageSize.getHeight() - 10);
                }
            });

            const filename = `Diamond_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
            doc.save(filename);
            toast.success("PDF exported successfully");
        } catch (error) {
            console.error("PDF export failed:", error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to export PDF");
        } finally {
            setIsDownloadingPDF(false);
        }
    }, [diamond, sortData, partyId, statusId, paymentStatusId, kapanNumber, searchTerm, startDate, endDate]);


    return (
        <div className="h-full flex flex-col justify-between px-1 py-5 md:p-0">
            <div>
                {showTotal && (
                    <TotalsGrid diamond={diamond} />
                )}
                <div className={`${showTotal ? "max-h-[70vh] md:max-h-[70vh]" : "max-h-[85vh] md:max-h-[81vh]"} overflow-auto rounded-xl shadow-md border border-gray-300`}>
                    <table className="w-full table table-zebra text-sm">
                        <thead className="sticky top-0 z-10 bg-base-content text-base-100">
                            <tr className="text-center">
                                <th className="p-2">NO</th>
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

                        {(!diamondLoading && !diamond?.data || diamond?.data.length === 0) ? (
                            <tbody>
                                <tr>
                                    <td colSpan={20} className="text-center py-6 text-lg text-slate-600">No data found.</td>
                                </tr>
                            </tbody>
                        ) : (
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

                                                <EditableCell
                                                    item={item}
                                                    field="partyId"
                                                    type="select"
                                                    options={partyOptions}
                                                    loading={isLoading}
                                                    displayValue={item.partyId?.name || "-"}
                                                />

                                                <EditableCell item={item} field="date" type="date" displayValue={formatDateMaybe(item.date)} />
                                                <td className="px-2 py-3.5 whitespace-nowrap">KD{item.uniqueId || "-"}</td>
                                                <EditableCell item={item} field="kapanNumber" displayValue={item.kapanNumber || "-"} />
                                                <EditableCell item={item} field="PKTNumber" displayValue={item.PKTNumber || "-"} />
                                                <EditableCell item={item} field="issueWeight" type="number" displayValue={item.issueWeight || "-"} />
                                                <EditableCell item={item} field="expectedWeight" type="number" displayValue={item.expectedWeight || "-"} />

                                                <EditableCell item={item} field="shapeId" type="select" options={shapeOptions} loading={isLoading} displayValue={item.shapeId?.name || "-"} />

                                                <EditableCell item={item} field="polishWeight" type="number" displayValue={item.polishWeight || "-"} />

                                                <EditableCell item={item} field="colorId" type="select" options={colorOptions} loading={isLoading} displayValue={item.colorId?.name || "-"} />

                                                <EditableCell item={item} field="clarityId" type="select" options={clarityOptions} loading={isLoading} displayValue={item.clarityId?.name || "-"} />

                                                <EditableCell item={item} field="polishDate" type="date" displayValue={formatDateMaybe(item.polishDate)} />

                                                <td className="px-2 py-3.5 whitespace-nowrap">{item.rate || "-"}</td>
                                                <td className="px-2 py-3.5 whitespace-nowrap">
                                                    {item.amount != null ? item.amount.toFixed(2) : "-"}
                                                </td>

                                                <EditableCell item={item} field="statusId" type="select" options={statusOptions} loading={isLoading} displayValue={item.statusId?.name || "-"} />

                                                <EditableCell item={item} field="HPHTWeight" type="number" displayValue={item.HPHTWeight || "-"} />

                                                <EditableCell item={item} field="HPHTDate" type="date" displayValue={formatDateMaybe(item.HPHTDate)} />

                                                <EditableCell item={item} field="paymentStatusId" type="select" options={paymentStatusOptions} loading={isLoading} displayValue={item.paymentStatusId?.name || "-"} />

                                                <EditableCell item={item} field="remark" displayValue={item.remark || "-"} />
                                            </motion.tr>
                                        )
                                        )
                                }
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-3">
                <button
                    className={`btn btn-sm btn-success ${isDownloadingExcel ? "loading" : ""}`}
                    onClick={() => openExportModal('excel')}
                    disabled={isDownloadingExcel || isDownloadingPDF}
                    aria-label="Download Excel"
                >
                    Download
                </button>
            </div>
            <Pagination page={page} totalPages={diamond?.totalPages} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
            {/* Export fields selection modal */}
            <div className={`modal ${exportModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box w-11/12 max-w-4xl p-4 sm:p-6">

                    {/* Header */}
                    <h3 className="font-semibold text-base sm:text-lg">
                        Select fields to export
                    </h3>

                    {/* Actions Row */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="btn btn-xs sm:btn-sm btn-outline"
                                onClick={selectAllFields}
                                disabled={fieldsLoading || exportFields.length === 0}
                            >
                                Select All
                            </button>
                            <button
                                className="btn btn-xs sm:btn-sm btn-outline"
                                onClick={clearAllFields}
                                disabled={fieldsLoading || exportFields.length === 0}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-500">
                            {fieldsLoading
                                ? "Loading fields..."
                                : `${exportFields.length} fields available`}
                        </div>
                    </div>

                    {/* Fields List */}
                    <div className="mt-3 border rounded-lg p-2 sm:p-3 max-h-64 sm:max-h-72 overflow-y-auto">
                        {exportFields.length === 0 && !fieldsLoading ? (
                            <div className="text-sm text-slate-500 text-center py-6">
                                No fields available for export.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {exportFields.map((field, idx) => (
                                    <label
                                        key={field}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-base-200 cursor-pointer"
                                    >
                                        <input
                                            ref={idx === 0 ? modalFirstCheckboxRef : undefined}
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={selectedFields.includes(field)}
                                            onChange={() => toggleField(field)}
                                        />
                                        <span className="text-sm truncate">{field}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-action flex gap-2 sm:justify-end">
                        <button
                            className="btn btn-sm btn-success sm:w-auto"
                            onClick={() => handleModalDownload("excel")}
                            disabled={
                                fieldsLoading ||
                                selectedFields.length === 0 ||
                                exportRows.length === 0 ||
                                isDownloadingExcel
                            }
                        >
                            Download Excel
                        </button>

                        <button
                            className="btn btn-sm btn-error sm:w-auto"
                            onClick={() => handleModalDownload("pdf")}
                            disabled={
                                fieldsLoading ||
                                selectedFields.length === 0 ||
                                exportRows.length === 0 ||
                                isDownloadingPDF
                            }
                        >
                            Download PDF
                        </button>

                        <button
                            className="btn btn-sm sm:w-auto"
                            onClick={closeExportModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiamondTable;

DiamondTable.propTypes = {
    showTotal: PropTypes.bool,
    showIcon: PropTypes.bool,
};

DiamondTable.defaultProps = {
    showTotal: true,
    showIcon: false,
};