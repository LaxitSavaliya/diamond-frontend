import { Funnel } from "lucide-react";
import { allParty, allPaymentStatus, allStatus } from "../Lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFilter } from "../Context/filterContext";

const Filter = () => {
    const {
        record, setRecord,
        partyId, setPartyId,
        statusId, setStatusId,
        paymentStatusId, setPaymentStatusId,
        kapanNumber, setKapanNumber,
        search, setSearch,
        startDate, setStartDate,
        endDate, setEndDate,
        clearFilters
    } = useFilter();

    const { data: partiesResp = {} } = useQuery({
        queryKey: ["party"],
        queryFn: allParty,
    });

    const { data: statusResp = {} } = useQuery({
        queryKey: ["status"],
        queryFn: allStatus,
    });

    const { data: paymentStatusResp = {} } = useQuery({
        queryKey: ["paymentStatus"],
        queryFn: allPaymentStatus,
    });

    const kapanList =
        partiesResp?.data
            ?.filter((p) => partyId.includes(p._id))
            ?.flatMap((p) => p.kapanNumbers)
            ?.filter((v, i, arr) => arr.indexOf(v) === i) || [];

    useEffect(() => {
        setKapanNumber((prev) => prev.filter((kp) => kapanList.includes(kp)));
    }, [partyId]);

    return (
        <div className="dropdown dropdown-end">

            {/* Trigger Button */}
            <button tabIndex={0} className="btn btn-ghost btn-circle">
                <Funnel className="size-5" />
            </button>

            {/* Dropdown Panel */}
            <div
                tabIndex={0}
                className="dropdown-content mt-3 p-4 shadow-xl bg-base-200 backdrop-blur-lg 
        rounded-2xl w-[90vw] md:w-xl border border-base-content/10 space-y-4 max-h-[90vh] overflow-auto"
            >

                {/* RECORD & SEARCH */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text">Record / Page</span></label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            value={record}
                            onChange={(e) => setRecord(e.target.value)}
                        />
                    </div>

                    <div className="form-control w-full">
                        <label className="label"><span className="label-text">Search (Unique ID)</span></label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter Unique ID"
                        />
                    </div>
                </div>

                {/* PARTY MULTI SELECT */}
                <div className="form-control w-full">
                    <label className="label"><span className="label-text">Party</span></label>
                    <div className="dropdown w-full">

                        {/* Selected Chips */}
                        <label
                            tabIndex={0}
                            className="input input-bordered w-full p-2 flex flex-wrap gap-2 cursor-pointer min-h-10 max-h-24 overflow-y-auto"
                        >
                            {partyId.length === 0 && <span className="text-gray-400">Select parties</span>}
                            {partyId.map((id) => {
                                const party = partiesResp?.data?.find((p) => p._id === id);
                                return (
                                    <span
                                        key={id}
                                        className="badge badge-primary gap-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPartyId((prev) => prev.filter((v) => v !== id));
                                        }}
                                    >
                                        {party?.name}
                                    </span>
                                );
                            })}
                        </label>

                        {/* Dropdown List */}
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-auto"
                        >
                            {partiesResp?.data?.map((p) => {
                                const isSelected = partyId.includes(p._id);
                                return (
                                    <li key={p._id}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                                checked={isSelected}
                                                onChange={() => {
                                                    if (isSelected) {
                                                        setPartyId((prev) => prev.filter((v) => v !== p._id));
                                                    } else {
                                                        setPartyId((prev) => [...prev, p._id]);
                                                    }
                                                }}
                                            />
                                            <span>{p.name}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* KAPAN */}
                <div className="form-control w-full">
                    <label className="label"><span className="label-text">Kapan Number</span></label>
                    <div className="dropdown w-full">
                        <label
                            tabIndex={0}
                            className="input input-bordered w-full p-2 flex flex-wrap gap-2 cursor-pointer min-h-10 max-h-24 overflow-y-auto"
                        >
                            {kapanNumber.length === 0 && <span className="text-gray-400">Select Kapan Numbers</span>}
                            {kapanNumber.map((kp) => (
                                <span
                                    key={kp}
                                    className="badge badge-primary gap-1 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setKapanNumber((prev) => prev.filter((v) => v !== kp));
                                    }}
                                >
                                    {kp}
                                </span>
                            ))}
                        </label>

                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-auto"
                        >
                            {kapanList.length === 0 && <li className="text-center text-gray-400">No Kapan Numbers</li>}
                            {kapanList.map((kp) => {
                                const isSelected = kapanNumber.includes(kp);
                                return (
                                    <li key={kp}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                                checked={isSelected}
                                                onChange={() => {
                                                    if (isSelected) {
                                                        setKapanNumber((prev) => prev.filter((v) => v !== kp));
                                                    } else {
                                                        setKapanNumber((prev) => [...prev, kp]);
                                                    }
                                                }}
                                            />
                                            <span>{kp}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* STATUS & PAYMENT STATUS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text">Status</span></label>
                        <div className="dropdown w-full">
                            <label
                                tabIndex={0}
                                className="input input-bordered w-full p-2 flex flex-wrap gap-2 cursor-pointer min-h-10 max-h-24 overflow-y-auto"
                            >
                                {statusId.length === 0 && <span className="text-gray-400">Select Status</span>}
                                {statusId.map((id) => {
                                    const status = statusResp?.data?.find((p) => p._id === id);
                                    return (
                                        <span
                                            key={id}
                                            className="badge badge-primary gap-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusId((prev) => prev.filter((v) => v !== id));
                                            }}
                                        >
                                            {status?.name}
                                        </span>
                                    );
                                })}
                            </label>

                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-auto"
                            >
                                {statusResp?.data?.map((p) => {
                                    const isSelected = statusId.includes(p._id);
                                    return (
                                        <li key={p._id}>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        if (isSelected) {
                                                            setStatusId((prev) => prev.filter((v) => v !== p._id));
                                                        } else {
                                                            setStatusId((prev) => [...prev, p._id]);
                                                        }
                                                    }}
                                                />
                                                <span>{p.name}</span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text">Payment Status</span></label>
                        <div className="dropdown w-full">
                            <label
                                tabIndex={0}
                                className="input input-bordered w-full p-2 flex flex-wrap gap-2 cursor-pointer min-h-10 max-h-24 overflow-y-auto"
                            >
                                {paymentStatusId.length === 0 && <span className="text-gray-400">Select Status</span>}
                                {paymentStatusId.map((id) => {
                                    const paymentStatus = paymentStatusResp?.data?.find((p) => p._id === id);
                                    return (
                                        <span
                                            key={id}
                                            className="badge badge-primary gap-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPaymentStatusId((prev) => prev.filter((v) => v !== id));
                                            }}
                                        >
                                            {paymentStatus?.name}
                                        </span>
                                    );
                                })}
                            </label>

                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-auto"
                            >
                                {paymentStatusResp?.data?.map((p) => {
                                    const isSelected = paymentStatusId.includes(p._id);
                                    return (
                                        <li key={p._id}>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        if (isSelected) {
                                                            setPaymentStatusId((prev) => prev.filter((v) => v !== p._id));
                                                        } else {
                                                            setPaymentStatusId((prev) => [...prev, p._id]);
                                                        }
                                                    }}
                                                />
                                                <span>{p.name}</span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Start</span></label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text">End</span></label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end">
                    <button onClick={clearFilters} className="btn btn-primary btn-sm text-white">
                        Clear
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Filter;