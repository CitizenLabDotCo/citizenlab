export interface CopyRequestParams {
  toPhaseId: string;
  fromPhaseId: string;
  dryRun?: boolean;
  allowDuplicates?: boolean;
}
