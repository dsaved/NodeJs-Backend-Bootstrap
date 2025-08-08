import { enums } from '../constructs';

// Base interface that all models should extend
export interface BaseModel {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Notification model interface
export interface Notification extends BaseModel {
  status: number; // EmailStatusNum values
  to: string;
  from: string;
  subject: string;
  text: string;
  seen: boolean;
  type: number; // NotificationTypeEnumNum values
  attachments?: any;
}

export interface CreateNotificationInput {
  status: number;
  to: string;
  from: string;
  subject: string;
  text: string;
  seen: boolean;
  type?: number;
  attachments?: any;
}

export interface UpdateNotificationInput {
  status?: number;
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
  seen?: boolean;
  type?: number;
  attachments?: any;
}

// Validation functions for Notification enum fields
export const validateEmailStatus = (status: any): status is number => {
  return Object.values(enums.EmailStatusNum).includes(status);
};

export const validateNotificationType = (type: any): type is number => {
  return Object.values(enums.NotificationTypeEnumNum).includes(type);
};

// Default values for Notification
export const defaultNotificationValues = {
  type: enums.NotificationTypeEnumNum.email,
  seen: false,
};
