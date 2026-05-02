/**
 * Milestone represents a specific goal or task within a career plan
 */
export interface Milestone {
  _id?: string;
  title: string;
  type: 'skill' | 'project' | 'certification' | 'other';
  estimateHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string; // ISO date
  completed: boolean;
  completedAt?: string; // ISO date
  evidence: string[]; // URLs or file paths
  notes?: string;
}

/**
 * Recommendation represents AI-generated or rule-based suggestions
 */
export interface Recommendation {
  _id?: string;
  source: 'AI' | 'RULE' | 'USER';
  type: string; // e.g., 'SKILL_GAP', 'RESOURCE', 'MARKET_INSIGHT'
  payload: Record<string, any>; // Flexible data structure
  confidence?: number;
  accepted?: boolean;
  modelVersion?: string;
  createdAt?: string; // ISO date
}

/**
 * CareerPlan represents a user's personalized career development roadmap
 */
export interface CareerPlan {
  _id?: string;
  userId?: string;
  title: string;
  targetRole: string;
  careerGoal?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  overallProgress: number; // 0-100 percentage
  milestones: Milestone[];
  recommendations: Recommendation[];
  recommendedSkills?: string[];
  weeklyTasks?: string[];
  skillGapAnalysis?: string[];
  notes?: string;
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
  __v?: number; // Version key for optimistic locking
  aiReady?: boolean; // True when AI has generated initial milestones
  aiGeneratedAt?: string; // ISO date when AI last ran
}

/**
 * Request/Response types for API calls
 */
export interface CreatePlanRequest {
  title: string;
  targetRole: string;
  timeframe?: string;
  intensity?: string;
}

export interface UpdatePlanRequest {
  title?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  notes?: string;
}

export interface CompleteMilestoneRequest {
  milestoneId: string;
  evidence?: string[];
  notes?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
