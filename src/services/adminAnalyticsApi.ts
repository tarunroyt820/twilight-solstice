import http from "./http";
import { getAuthHeader } from "@/utils/authToken";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/analytics`;

export interface AdminAnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalAgreements: number;
  completedAgreements: number;
  platformCompletionRate: number;
  openDisputes: number;
  expiredRequests: number;
  averageQualityScore: number;
  averageCompletionStreak: number;
  achievementPercentage: number;
  topCompletionStreakUsers: HighRiskUser[];
}

export interface HighRiskUser {
  _id?: string;
  fullName?: string;
  trustScore?: number;
  qualityScore?: number;
  riskFlags?: string[];
  completionStreak?: number;
  responseStreak?: number;
  achievements?: string[];
}

export const fetchAdminSummary = () => {
  return http.get<AdminAnalyticsSummary>(`${BASE_URL}/summary`, {
    headers: getAuthHeader(),
  });
};

export const fetchHighRiskUsers = () => {
  return http.get<{ success: boolean; users: HighRiskUser[] }>(`${BASE_URL}/high-risk-users`, {
    headers: getAuthHeader(),
  });
};
