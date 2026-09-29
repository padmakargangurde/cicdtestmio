import { ApprovalItemDto, CategoryDto, ReviewDecision } from '../../Revisions/models/revision.model';
import { FinalSubmissionStatusDto } from '../../FinalSubmission/models/final-submission.model';

export interface ReviewStatsDto {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  commented: number;
  clarify: number;
  na: number;
}

export interface ClientReviewDto {
  projectNumber: string;
  name: string;
  clientName: string;
  revisionLabel: string;
  reviewStats: ReviewStatsDto;
  finalStatus: FinalSubmissionStatusDto;
  categories: CategoryDto[];
  items: ApprovalItemDto[];
}

export interface SubmitResponseRequest {
  decision: ReviewDecision;
  comment?: string | null;
  reviewedByName?: string | null;
  userId?: number | null;
  email?: string | null;
}

export interface IdentifyClientRequest {
  name: string;
  email: string;
}

export interface IdentifyClientResult {
  userId: number;
  name: string;
  email: string;
}

export interface ItemResponseDto {
  itemIdentityId: number;
  decision: ReviewDecision;
  comment: string | null;
  reviewedByName: string | null;
  respondedAt: string | null;
}

export interface SubmitFinalRequest {
  submittedByName: string;
  submittedByCompany?: string | null;
}
