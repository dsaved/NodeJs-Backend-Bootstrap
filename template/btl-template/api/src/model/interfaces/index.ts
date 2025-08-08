// Interface Models Index
// Import all interface models for the BTL template

export * from './users.model';
export { 
  Notification, 
  CreateNotificationInput, 
  UpdateNotificationInput,
  validateEmailStatus,
  validateNotificationType,
  defaultNotificationValues
} from './notifications.model';

// Note: Add other interface model exports as they are created
