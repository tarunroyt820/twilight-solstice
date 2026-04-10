export interface CareerPlanMilestone {
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
}

export interface CareerPlan {
    _id?: string;
    userId?: string;
    careerGoal: string;
    milestones: CareerPlanMilestone[];
    weeklyTasks: string[];
    recommendedSkills: string[];
    recommendedCourses: string[];
    skillGapAnalysis: string[];
    status: "active" | "completed" | "draft";
    providerUsed?: string;
    createdByAI?: boolean;
    lastUpdated?: string;
}
