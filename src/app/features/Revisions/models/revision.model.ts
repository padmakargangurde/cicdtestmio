export type ItemChangeType = 'Added' | 'Modified' | 'Unchanged' | 'Removed';
export type ReviewDecision = 'Pending' | 'Approved' | 'Rejected' | 'Commented' | 'Clarify' | 'NA';

export interface UploadRevisionResult {
  revisionId: number;
  revisionNumber: number;
  label: string;
  categoryCount: number;
  totalItems: number;
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  unchangedCount: number;
  warnings: string[];
}

export interface RevisionListItemDto {
  revisionId: number;
  revisionNumber: number;
  label: string;
  uploadedAt: string;
  uploadedByName: string | null;
  isActive: boolean;
  itemCount: number;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
  columns: string[];
  specReference: string | null;
  warnings: string[];
}

export interface CommentEntryDto {
  userId: number | null;
  email: string | null;
  comment: string;
  reviewedByName: string | null;
  role: string | null;
  createdAt: string;
}

export interface ApprovalItemDto {
  itemId: number;
  itemIdentityId: number;
  categoryName: string;
  section: string | null;
  itemNo: number;
  fields: Record<string, string | null>;
  sourceStatus: string | null;
  specReference: string | null;
  lowConfidence: boolean;
  changeType: ItemChangeType;
  decision: ReviewDecision;
  comment: string | null;
  reviewedByName: string | null;
  respondedAt: string | null;
  comments: CommentEntryDto[];
}

export interface RevisionDetailDto {
  revisionId: number;
  revisionNumber: number;
  label: string;
  isActive: boolean;
  categories: CategoryDto[];
  items: ApprovalItemDto[];
}
