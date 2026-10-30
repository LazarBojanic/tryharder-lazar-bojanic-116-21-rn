export interface OperationError {
  id: string;
  timestamp: Date;
  resourceId: string;
  operation: string;
  cause: string;
}
