import http from "./http";
import { getAuthHeader } from "@/utils/authToken";

export interface DiscoveryParams {
  personName?: string;
  skillOffered?: string;
  skillWanted?: string;
  category?: string;
  minTrustScore?: number;
  maxHourlyRate?: number;
  availabilityOverlap?: boolean;
  availableThisWeek?: boolean;
  sortBy?: "match" | "trust" | "rate";
  page?: number;
  limit?: number;
}

export interface DiscoveryProfile {
  _id: string;
  userId?: {
    _id: string;
    fullName?: string;
    trustScore?: number;
    activeExchangeCount?: number;
  };
  skillsOffered?: Array<{ name?: string; category?: string; proficiencyLevel?: string }>;
  skillsWanted?: Array<{ name?: string; category?: string; proficiencyLevel?: string }>;
  hourlyRate?: number;
  bio?: string;
  matchScore?: number;
  matchReasons?: string[];
  completionRate?: number;
  responseRate?: number;
  availabilityOverlap?: number;
  reliabilityBadges?: string[];
  achievements?: string[];
  completionStreak?: number;
  responseStreak?: number;
  activityScore?: number;
  smartScore?: number;
}

export interface TrendingSkillItem {
  _id: string;
  count: number;
}

export interface DiscoverySearchResponse {
  success: boolean;
  page: number;
  totalPages: number;
  totalResults: number;
  results: DiscoveryProfile[];
}

export const searchProfiles = (params: DiscoveryParams) => {
  return http.get<DiscoverySearchResponse>(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/discovery/search`, {
    params,
    headers: getAuthHeader(),
  });
};

export const fetchTrendingSkills = () => {
  return http.get<{ success: boolean; trending: TrendingSkillItem[] }>(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/discovery/trending-skills`,
    {
      headers: getAuthHeader(),
    },
  );
};

