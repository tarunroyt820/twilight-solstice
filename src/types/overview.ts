export type OverviewActivityType = "learning" | "mentor" | "career" | "achievement";

export interface OverviewUser {
  id: string;
  fullName: string;
  jobTitle: string;
  experienceLevel: string;
  careerGoal: string;
  skillsCount: number;
  profileCompletion: number;
}

export interface OverviewStats {
  profileCompletion: number;
  skillsMastered: number;
  conversationCount: number;
  activityCount: number;
}

export interface OverviewTrajectory {
  title: string;
  subtitle: string;
  status: "on_track" | "attention" | "at_risk";
  overallCompletion: number;
  currentNode: string;
  careerGoal: string;
  sectionsCompleted: number;
  sectionsTotal: number;
  phaseLabels: string[];
}

export interface OverviewActivity {
  id: string;
  type: OverviewActivityType;
  title: string;
  timestamp: string;
}

export interface OverviewRecommendation {
  id: string;
  name: string;
  level: string;
  demand: "High" | "Medium" | "Low";
  progress: number;
  category: string;
}

export interface OverviewActions {
  canGenerateReport: boolean;
  canRefreshRecommendations: boolean;
  reportAvailable: boolean;
}

export interface DashboardOverviewData {
  success: boolean;
  message: string;
  lastUpdated: string;
  user: OverviewUser;
  overviewStats: OverviewStats;
  trajectory: OverviewTrajectory;
  activityFeed: OverviewActivity[];
  recommendations: OverviewRecommendation[];
  actions: OverviewActions;
}
