import axios from "./http";
import { CareerPlan } from "@/types/careerPlan";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/career-plan`;

const getAuthHeader = () => {
    const token = localStorage.getItem("nextro_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCareerPlan = async (): Promise<CareerPlan> => {
    const response = await axios.get<CareerPlan>(API_URL, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const generateCareerPlan = async (): Promise<{ success: boolean; answer: string; savedPlan: CareerPlan }> => {
    const response = await axios.post<{ success: boolean; answer: string; savedPlan: CareerPlan }>(
        `${API_URL}/generate`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const updateMilestoneCompletion = async (index: number, completed: boolean): Promise<CareerPlan> => {
    const response = await axios.patch<CareerPlan>(
        `${API_URL}/milestone/${index}`,
        { completed },
        { headers: getAuthHeader() }
    );
    return response.data;
};
