export interface FinalSubmissionStatusDto {
  isLocked: boolean;
  submittedByName: string | null;
  submittedByCompany: string | null;
  submittedAt: string | null;
  approvedCount: number | null;
  rejectedCount: number | null;
  clarifyCount: number | null;
  naCount: number | null;
  commentedCount: number | null;
  reopenedAt: string | null;
}
