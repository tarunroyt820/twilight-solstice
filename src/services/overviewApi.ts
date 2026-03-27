import axios from "axios";
import { DashboardOverviewData } from "@/types/overview";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/dashboard/overview`;

export const getOverviewData = async (): Promise<DashboardOverviewData> => {
  const response = await axios.get<DashboardOverviewData>(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("nextro_token") || ""}`,
    },
  });

  return response.data;
};
