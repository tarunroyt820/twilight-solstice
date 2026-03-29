import { UserProfile } from "@/types/profile";

export interface TemporaryAIProfileFields {
  targetRole: string;
  yearsOfExperience: string;
  preferredIndustry: string;
  workPreference: string;
  preferredLocation: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  certifications: string[];
  tools: string[];
  strengths: string[];
  improvementAreas: string[];
  aiSummary: string;
}

export type EnhancedProfile = UserProfile & TemporaryAIProfileFields;
