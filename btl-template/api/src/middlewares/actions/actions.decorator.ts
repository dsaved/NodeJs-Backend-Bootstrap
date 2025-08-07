import { SetMetadata } from '@nestjs/common';

export enum ActionList {
  VIEW_STATISTICS = 'viewStatistics',
  VIEW_SINGLE_RECORD = 'viewSingleRecord',
  LIST_RECORDS = 'listRecords',
  APPROVE_RECORD = 'approveRecord',
  DELETE_RECORD = 'deleteRecord',
  QUERY_RECORD = 'queryRecord',
  MODIFY_RECORD = 'modifyRecord',
  CREATE_RECORD = 'createRecord',
  ARCHIVE_RECORD = 'archiveRecord',
  EXPORT_RECORD = 'exportRecord',
  IMPORT_RECORD = 'importRecord',
  PRINT_RECORD = 'printRecord',
  REJECT_RECORD = 'rejectRecord',
  LOCK_RECORD = 'lockRecord',
  UNLOCK_RECORD = 'unlockRecord',
  RESTORE_RECORD = 'restoreRecord',
  DUPLICATE_RECORD = 'duplicateRecord',
  FLAG_RECORD = 'flagRecord',
  UNFLAG_RECORD = 'unflagRecord',
  ASSIGN_RECORD = 'assignRecord',
  UNASSIGN_RECORD = 'unassignRecord',
  ESCALATE_RECORD = 'escalateRecord',
  RESOLVE_RECORD = 'resolveRecord',
  TRACK_RECORD_CHANGES = 'trackRecordChanges',
}

export const _KEY = 'actions';
export const Actions = (...actions: ActionList[]) => SetMetadata(_KEY, actions);
