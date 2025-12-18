import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://diamond-backend-t6cb.onrender.com/api",
  // baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return null;
  }
};

export const login = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
}

const getList = async (url, page, search, status) => {
  const response = await axiosInstance.get(url, {
    params: { page, search, status },
  });
  return response.data;
};

const createItem = async (url, data) => {
  const response = await axiosInstance.post(url, data);
  return response.data?.data;
};

const updateItem = async (url, id, data) => {
  const response = await axiosInstance.put(`${url}/${id}`, data);
  return response.data?.data;
};

const deleteItem = async (url, id) => {
  const response = await axiosInstance.delete(`${url}/${id}`);
  return response.data?.data;
};

export const colorData = (page, search, status) =>
  getList("/color", page, search, status);

export const addColor = (data) => createItem("/color", data);
export const updateColor = (id, data) => updateItem("/color", id, data);
export const deleteColor = (id) => deleteItem("/color", id);

export const clarityData = (page, search, status) =>
  getList("/clarity", page, search, status);

export const addClarity = (data) => createItem("/clarity", data);
export const updateClarity = (id, data) => updateItem("/clarity", id, data);
export const deleteClarity = (id) => deleteItem("/clarity", id);

export const shapeData = (page, search, status) =>
  getList("/shape", page, search, status);

export const addShape = (data) => createItem("/shape", data);
export const updateShape = (id, data) => updateItem("/shape", id, data);
export const deleteShape = (id) => deleteItem("/shape", id);

export const partyData = (page, search, status) =>
  getList("/party", page, search, status);

export const addParty = (data) => createItem("/party", data);
export const updateParty = (id, data) => updateItem("/party", id, data);
export const deleteParty = (id) => deleteItem("/party", id);

export const statusData = (page, search, status) =>
  getList("/status", page, search, status);

export const addStatus = (data) => createItem("/status", data);
export const updateStatus = (id, data) => updateItem("/status", id, data);
export const deleteStatus = (id) => deleteItem("/status", id);

export const paymentStatusData = (page, search, status) =>
  getList("/paymentStatus", page, search, status);

export const addPaymentStatus = (data) => createItem("/paymentStatus", data);
export const updatePaymentStatus = (id, data) =>
  updateItem("/paymentStatus", id, data);
export const deletePaymentStatus = (id) => deleteItem("/paymentStatus", id);

export const userData = async () => {
  const response = await axiosInstance.get("/auth/users");
  return response.data;
};

export const allParty = async () => {
  const response = await axiosInstance.get("/party/allParty");
  return response.data;
};

export const allShape = async () => {
  const response = await axiosInstance.get("/shape/allShape");
  return response.data;
};

export const allColor = async () => {
  const response = await axiosInstance.get("/color/allColors");
  return response.data;
};

export const allStatus = async () => {
  const response = await axiosInstance.get("/status/allStatus");
  return response.data;
};

export const allClarity = async () => {
  const response = await axiosInstance.get("/clarity/allClarity");
  return response.data;
};

export const allPaymentStatus = async () => {
  const response = await axiosInstance.get("/paymentStatus/allPaymentStatus");
  return response.data;
};

export const addDiamondLot = (data) => createItem("/diamondLot", data);

export const diamondLotData = async () => {
  const response = await axiosInstance.get("/diamondLot");
  return response.data;
};

export const diamondData = async ({
  uniqueIdReverse,
  dateReverse,
  polishDateReverse,
  HPHTDateReverse,
  partyId,
  statusId,
  paymentStatusId,
  kapanNumber,
  record,
  page,
  search,
  startDate,
  endDate,
}) => {
  const response = await axiosInstance.get("/diamondLot", {
    params: { uniqueIdReverse, dateReverse, polishDateReverse, HPHTDateReverse, partyId, statusId, paymentStatusId, kapanNumber, record, page, search, startDate, endDate },
  });
  return response.data;
};
export const diamondLot = async ({ uniqueId }) => {
  try {
    const response = await axiosInstance.get("/diamondLot/lot", {
      params: { uniqueId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching diamond lot:", error.response?.data || error.message);
    throw error; // rethrow so calling code can handle it
  }
};


export const updateDiamondLot = (id, data) =>
  updateItem("/diamondLot", id, data);

export const getRates = async ({ partyId }) => {
  const response = await axiosInstance.get("/rate", {
    params: { partyId },
  });
  return response.data;
};

export const createRate = (data) => createItem("/rate", data);

export const addRate = (id, data) => updateItem("/rate", id, data);

export const deleteRate = (id) => deleteItem("/rate", id);

export const deleteRateItem = async (id, data) => {
  const response = await axiosInstance.put(`/rate/deleteItem/${id}`, data);
  return response.data;
}

export const employeeData = (page, search, status) =>
  getList("/employee", page, search, status);

export const addEmployee = (data) => createItem("/employee", data);
export const updateEmployee = (id, data) => updateItem("/employee", id, data);
export const deleteEmployee = (id) => deleteItem("/employee", id);


export const allAttendance = async (month, year) => {
    const res = await axiosInstance.get(`/attendance`, {
        params: { month, year },
    });
    return res.data;
};

export const addAttendance = (data) => createItem("/attendance", data);
