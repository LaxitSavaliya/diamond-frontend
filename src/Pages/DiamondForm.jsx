import { useState } from "react";
import { allClarity, allColor, allParty, allPaymentStatus, allShape, allStatus, partyData, userData } from "../Lib/api";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { useTheme } from "../Context/themeContext";

const DiamondForm = () => {

    const { dark } = useTheme();

    const [formData, setFormData] = useState({
        userId: "",
        partyId: "",
        kapanNumber: "",
        PKTNumber: "",
        issueWeight: "",
        expectedWeight: "",
        shapeId: "",
        polishWeight: "",
        colorId: "",
        clarityId: "",
        polishDate: "",
        statusId: "",
        HPHTWeight: "",
        HPHTDate: "",
        paymentStatusId: "",
        date: "",
        remark: ""
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: userData,
    });

    const { data: parties = [] } = useQuery({
        queryKey: ["party"],
        queryFn: allParty,
    });

    const { data: shapes = [] } = useQuery({
        queryKey: ["shape"],
        queryFn: allShape,
    });

    const { data: colors = [] } = useQuery({
        queryKey: ["color"],
        queryFn: allColor,
    });

    const { data: status = [] } = useQuery({
        queryKey: ["status"],
        queryFn: allStatus,
    });

    const { data: clarity = [] } = useQuery({
        queryKey: ["clarity"],
        queryFn: allClarity,
    });

    const { data: paymentStatus = [] } = useQuery({
        queryKey: ["paymentStatus"],
        queryFn: allPaymentStatus,
    });

    const userOptions =
        users?.data?.map((u) => ({
            value: u._id,
            label: u.userName,
        })) || [];

    const partyOptions =
        parties?.data?.map((p) => ({
            value: p._id,
            label: p.name,
        })) || [];

    const shapeOptions =
        shapes?.data?.map((s) => ({
            value: s._id,
            label: s.name,
        })) || [];

    const colorOptions =
        colors?.data?.map((c) => ({
            value: c._id,
            label: c.name,
        })) || [];

    const statusOptions =
        status?.data?.map((s) => ({
            value: s._id,
            label: s.name,
        })) || [];

    const clarityOptions =
        clarity?.data?.map((c) => ({
            value: c._id,
            label: c.name,
        })) || [];

    const paymentStatusOptions =
        paymentStatus?.data?.map((p) => ({
            value: p._id,
            label: p.name,
        })) || [];

    return (
        <div className="h-full p-5">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* USER ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="userId">User ID</label>
                    <Select
                        name="userId"
                        id="userId"
                        value={userOptions.find(u => u.value === formData.userId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, userId: selected.value })
                        }
                        options={userOptions}
                        placeholder="User ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* PARTY ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="partyId">Party ID</label>
                    <Select
                        name="partyId"
                        id="partyId"
                        value={partyOptions.find(p => p.value === formData.partyId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, partyId: selected.value })
                        }
                        options={partyOptions}
                        placeholder="Party ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* KAPAN NUMBER */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="kapanNumber">Kapan Number</label>
                    <input
                        type="text"
                        id="kapanNumber"
                        name="kapanNumber"
                        value={formData.kapanNumber}
                        onChange={handleChange}
                        placeholder="Kapan Number"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* PKT NUMBER */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="PKTNumber">PKT Number</label>
                    <input
                        type="text"
                        id="PKTNumber"
                        name="PKTNumber"
                        value={formData.PKTNumber}
                        onChange={handleChange}
                        placeholder="PKT Number"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* ISSUE WEIGHT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="issueWeight">Issue Weight</label>
                    <input
                        type="text"
                        id="issueWeight"
                        name="issueWeight"
                        value={formData.issueWeight}
                        onChange={handleChange}
                        placeholder="Issue Weight"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* EXPECTED WEIGHT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="expectedWeight">Expected Weight</label>
                    <input
                        type="text"
                        id="expectedWeight"
                        name="expectedWeight"
                        value={formData.expectedWeight}
                        onChange={handleChange}
                        placeholder="Expected Weight"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* SHAPE ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="shapeId">Shape ID</label>
                    <Select
                        name="shapeId"
                        id="shapeId"
                        value={shapeOptions.find(p => p.value === formData.shapeId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, shapeId: selected.value })
                        }
                        options={shapeOptions}
                        placeholder="Shape ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* POLISH WEIGHT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="polishWeight">Polish Weight</label>
                    <input
                        type="text"
                        id="polishWeight"
                        name="polishWeight"
                        value={formData.polishWeight}
                        onChange={handleChange}
                        placeholder="Polish Weight"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* COLOR ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="colorId">Color ID</label>
                    <Select
                        name="colorId"
                        id="colorId"
                        value={colorOptions.find(c => c.value === formData.colorId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, colorId: selected.value })
                        }
                        options={colorOptions}
                        placeholder="Color ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* CLARITY ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="clarityId">Clarity ID</label>
                    <Select
                        name="clarityId"
                        id="clarityId"
                        value={clarityOptions.find(c => c.value === formData.clarityId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, clarityId: selected.value })
                        }
                        options={clarityOptions}
                        placeholder="Clarity ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* POLISH DATE */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="polishDate">Polish Date</label>
                    <input
                        type="date"
                        id="polishDate"
                        name="polishDate"
                        value={formData.polishDate}
                        onChange={handleChange}
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* STATUS ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="statusId">Status ID</label>
                    <Select
                        name="statusId"
                        id="statusId"
                        value={statusOptions.find(s => s.value === formData.statusId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, statusId: selected.value })
                        }
                        options={statusOptions}
                        placeholder="Status ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* HPHT WEIGHT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="HPHTWeight">HPHT Weight</label>
                    <input
                        type="text"
                        id="HPHTWeight"
                        name="HPHTWeight"
                        value={formData.HPHTWeight}
                        onChange={handleChange}
                        placeholder="HPHT Weight"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* HPHT DATE */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="HPHTDate">HPHT Date</label>
                    <input
                        type="date"
                        id="HPHTDate"
                        name="HPHTDate"
                        value={formData.HPHTDate}
                        onChange={handleChange}
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* PAYMENT STATUS ID */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="paymentStatusId">Payment Status ID</label>
                    <Select
                        name="paymentStatusId"
                        id="paymentStatusId"
                        value={paymentStatusOptions.find(p => p.value === formData.paymentStatusId)}
                        onChange={(selected) =>
                            setFormData({ ...formData, paymentStatusId: selected.value })
                        }
                        options={paymentStatusOptions}
                        placeholder="Payment Status ID"
                        classNamePrefix="react-select"
                        isSearchable={true}
                    />
                </div>

                {/* DATE */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                {/* REMARK */}
                <div className="flex flex-col gap-1 col-span-2">
                    <label htmlFor="remark">Remark</label>
                    <input
                        type="text"
                        id="remark"
                        name="remark"
                        value={formData.remark}
                        onChange={handleChange}
                        placeholder="Remark"
                        className="input input-neutral bg-white text-base w-full"
                    />
                </div>

                <div className="flex gap-5">
                    <button className="btn btn-neutral px-6">Cancle</button>
                    <button type="submit" className="btn btn-info px-6">Submit</button>
                </div>

            </form>
        </div>
    );
};

export default DiamondForm;