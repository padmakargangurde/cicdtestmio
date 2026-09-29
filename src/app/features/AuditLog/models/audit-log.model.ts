export interface AuditLogEntryDto {
  timestamp: string;
  actorDisplayName: string;
  action: string;
  detail: string | null;
}
