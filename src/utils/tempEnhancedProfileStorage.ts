import { UserProfile } from "@/types/profile";
import { EnhancedProfile, TemporaryAIProfileFields } from "@/types/enhancedProfile";

const STORAGE_KEY = "nextaro_temp_ai_profile";

export const initialTemporaryAIProfileFields: TemporaryAIProfileFields = {
  targetRole: "",
  yearsOfExperience: "",
  preferredIndustry: "",
  workPreference: "",
  preferredLocation: "",
  portfolioUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  certifications: [],
  tools: [],
  strengths: [],
  improvementAreas: [],
  aiSummary: "",
};

export const loadTemporaryAIProfileFields = (): TemporaryAIProfileFields => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialTemporaryAIProfileFields;

    const parsed = JSON.parse(stored);
    return { ...initialTemporaryAIProfileFields, ...parsed };
  } catch (error) {
    console.error("Error loading temporary AI profile fields:", error);
    return initialTemporaryAIProfileFields;
  }
};

export const saveTemporaryAIProfileFields = (
  fields: TemporaryAIProfileFields,
): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch (error) {
    console.error("Error saving temporary AI profile fields:", error);
  }
};

export const mergeEnhancedProfile = (
  profile: UserProfile,
  fields: TemporaryAIProfileFields,
): EnhancedProfile => ({
  ...profile,
  ...fields,
});
