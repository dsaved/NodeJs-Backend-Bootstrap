export const auditAction = {
  LOGOUT: 'Account logged out',
  LOGIN: 'Account logged in',
  RECOVER: 'Account recovery',
  RECORD_MODIFIED: 'Modified a record',
  RECORD_ADD: 'Added record',
  RECORD_DELETE: 'Deleted record',
  RECORD_PRINTED: 'Printed record',
  RECORD_APPROVED: 'Approved record',
  RECORD_REJECTED: 'Rejected record',
};

export const acceptedMimeTypes = [
  // Text
  'text/plain',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',

  // Applications
  'application/pdf',
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
