import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [record, setRecord] = useState(20);
    const [partyId, setPartyId] = useState([]);
    const [kapanNumber, setKapanNumber] = useState([]);
    const [statusId, setStatusId] = useState([]);
    const [paymentStatusId, setPaymentStatusId] = useState([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const clearFilters = () => {
        setRecord(20);
        setPartyId([]);
        setStatusId([]);
        setPaymentStatusId([]);
        setSearch("");
        setStartDate("");
        setEndDate("");
        setKapanNumber([]);
    };

    return (
        <FilterContext.Provider
            value={{
                record, setRecord,
                partyId, setPartyId,
                statusId, setStatusId,
                paymentStatusId, setPaymentStatusId,
                kapanNumber, setKapanNumber,
                search, setSearch,
                startDate, setStartDate,
                endDate, setEndDate,
                clearFilters,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => useContext(FilterContext);