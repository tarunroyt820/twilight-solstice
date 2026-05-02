import axios from "./http";
import {
  CareerPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
  CompleteMilestoneRequest,
  ApiResponse,
} from "@/types/careerPlan";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/career-plans`;

const adaptCareerPlan = (plan: CareerPlan): CareerPlan => {
  const recommendedSkills = plan.milestones
    .filter((milestone) => milestone.type === "skill")
    .map((milestone) => milestone.title);

  const weeklyTasks = plan.milestones
    .filter((milestone) => !milestone.completed)
    .slice(0, 5)
    .map((milestone) => milestone.title);

  const skillGapAnalysis = plan.recommendations
    .filter((recommendation) =>
      recommendation.type?.toUpperCase().includes("SKILL_GAP")
    )
    .flatMap((recommendation) => {
      const payload = recommendation.payload || {};
      if (Array.isArray(payload.gaps)) return payload.gaps;
      if (Array.isArray(payload.skills)) return payload.skills;
      if (typeof payload.summary === "string") return [payload.summary];
      if (typeof payload.title === "string") return [payload.title];
      return [];
    });

  return {
    ...plan,
    careerGoal: plan.targetRole,
    recommendedSkills,
    weeklyTasks,
    skillGapAnalysis,
  };
};

/**
 * Create a new career plan
 */
export const createPlan = async (data: CreatePlanRequest): Promise<CareerPlan> => {
  const response = await axios.post<ApiResponse<CareerPlan>>(API_URL, data);
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create plan");
  }
  return adaptCareerPlan(response.data.data as CareerPlan);
};

/**
 * Get all plans for the current user
 */
export const getPlans = async (): Promise<CareerPlan[]> => {
  const response = await axios.get<ApiResponse<CareerPlan[]>>(API_URL);
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch plans");
  }
  return (response.data.data as CareerPlan[]).map(adaptCareerPlan);
};

/**
 * Get the current user's primary career plan
 * Compatibility helper for older dashboard screens.
 */
export const getCareerPlan = async (): Promise<CareerPlan | null> => {
  const plans = await getPlans();
  return plans[0] || null;
};

/**
 * Get a single plan by ID
 */
export const getPlan = async (id: string): Promise<CareerPlan> => {
  const response = await axios.get<ApiResponse<CareerPlan>>(`${API_URL}/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch plan");
  }
  return adaptCareerPlan(response.data.data as CareerPlan);
};

/**
 * Update a plan
 */
export const updatePlan = async (
  id: string,
  data: UpdatePlanRequest
): Promise<CareerPlan> => {
  const response = await axios.patch<ApiResponse<CareerPlan>>(
    `${API_URL}/${id}`,
    data
  );
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update plan");
  }
  return adaptCareerPlan(response.data.data as CareerPlan);
};

/**
 * Mark a milestone as complete
 */
export const completeMilestone = async (
  planId: string,
  data: CompleteMilestoneRequest
): Promise<CareerPlan> => {
  const response = await axios.post<ApiResponse<CareerPlan>>(
    `${API_URL}/${planId}/complete-milestone`,
    data
  );
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to complete milestone");
  }
  return adaptCareerPlan(response.data.data as CareerPlan);
};

/**
 * Refresh AI recommendations for a plan
 */
export const refreshPlan = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post<{ success: boolean; message: string }>(
    `${API_URL}/${id}/refresh`,
    {}
  );
  return response.data;
};
