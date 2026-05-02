/**
 * PlanTimeline Component
 * Displays milestones in a visual timeline format
 */

import { Milestone } from "@/types/careerPlan";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useState } from "react";
import MilestoneCard from "./MilestoneCard";

interface PlanTimelineProps {
  planId: string;
  milestones: Milestone[];
  onMilestoneComplete?: (milestoneId: string) => void;
}

export default function PlanTimeline({
  planId,
  milestones,
  onMilestoneComplete,
}: PlanTimelineProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null
  );

  if (milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          No milestones yet. AI is still generating your roadmap.
        </p>
      </div>
    );
  }

  const selectedMilestone = milestones.find((m) => m._id === selectedMilestoneId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline */}
      <div className="lg:col-span-2">
        <div className="relative border-l-2 border-primary/20 ml-4 pb-4 space-y-8">
          {milestones.map((milestone, index) => (
            <div
              key={milestone._id || index}
              className="relative pl-8 cursor-pointer group"
              onClick={() => setSelectedMilestoneId(milestone._id || null)}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full transition-all ${
                  milestone.completed
                    ? "bg-green-500 ring-2 ring-green-500/50"
                    : "bg-primary group-hover:ring-2 group-hover:ring-primary/50"
                }`}
              />

              {/* Milestone content */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  selectedMilestoneId === milestone._id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50 bg-card/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {milestone.notes || `Type: ${milestone.type}`}
                    </p>
                  </div>
                  {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="bg-muted/50 px-2 py-1 rounded">
                    ~{milestone.estimateHours}h
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      milestone.priority === "HIGH"
                        ? "bg-red-500/10 text-red-700 dark:text-red-300"
                        : milestone.priority === "MEDIUM"
                          ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                          : "bg-green-500/10 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {milestone.priority}
                  </span>
                  {milestone.dueDate && (
                    <span>
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-1">
        {selectedMilestone ? (
          <MilestoneCard
            planId={planId}
            milestone={selectedMilestone}
            onComplete={() => {
              onMilestoneComplete?.(selectedMilestone._id || "");
              setSelectedMilestoneId(null);
            }}
          />
        ) : (
          <div className="rounded-lg border border-border/50 p-6 text-center text-muted-foreground">
            <p>Select a milestone to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
