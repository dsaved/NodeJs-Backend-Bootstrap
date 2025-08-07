export enum EmailStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
export enum AccountStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEACTIVATED = 'deactivated',
}
export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
}
export enum StatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}
export enum VaccinationStatusEnum {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  UNCOMPLETED = 'Uncompleted',
}
export enum EmailType {
  PAYMENT = 'payment',
  DEFAULT = 'default',
}
export enum CivilStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  ENGAGED = 'engaged',
}
export enum LiteracyEnum {
  LITERATE = 'literate',
  ILLITERATE = 'illiterate',
}
export enum NotificationTypeEnum {
  EMAIL = 'email',
  SMS = 'sms',
}
export enum OrderTypeEnum {
  asc = 'ASC',
  desc = 'DESC',
}
export enum EmailStatusNum {
  pending = 0,
  processing = 1,
  completed = 2,
  failed = 3,
}
export enum AccountStatusEnumNum {
  inactive = 0,
  active = 1,
  deactivated = 2,
}
export enum GenderEnumNum {
  male = 0,
  female = 1,
}
export enum StatusEnumNum {
  pending = 0,
  approved = 1,
  rejected = 2,
  completed = 3,
}
export enum EmailTypeNum {
  payment = 0,
  default = 1,
}
export enum CivilStatusNum {
  single = 0,
  married = 1,
  divorced = 2,
  widowed = 3,
  separated = 4,
  engaged = 5,
}
export enum LiteracyEnumNum {
  literate = 0,
  illiterate = 1,
}
export enum NotificationTypeEnumNum {
  email = 0,
  sms = 1,
}

export function genderStatusFromNum(
  param: GenderEnumNum,
): GenderEnum | undefined {
  const mapping: Record<GenderEnumNum, GenderEnum> = {
    [GenderEnumNum.female]: GenderEnum.FEMALE,
    [GenderEnumNum.male]: GenderEnum.MALE,
  };
  return mapping[param];
}

export function accountStatusFromNum(
  param: AccountStatusEnumNum,
): AccountStatusEnum | undefined {
  const mapping: Record<AccountStatusEnumNum, AccountStatusEnum> = {
    [AccountStatusEnumNum.inactive]: AccountStatusEnum.INACTIVE,
    [AccountStatusEnumNum.active]: AccountStatusEnum.ACTIVE,
    [AccountStatusEnumNum.deactivated]: AccountStatusEnum.DEACTIVATED,
  };
  return mapping[param];
}

export function genderFromNum(param: GenderEnumNum): GenderEnum | undefined {
  const mapping: Record<GenderEnumNum, GenderEnum> = {
    [GenderEnumNum.male]: GenderEnum.MALE,
    [GenderEnumNum.female]: GenderEnum.FEMALE,
  };
  return mapping[param];
}

export function getNotificationTypeEnumNum(
  param: NotificationTypeEnumNum,
): NotificationTypeEnum | undefined {
  const mapping: Record<NotificationTypeEnumNum, NotificationTypeEnum> = {
    [NotificationTypeEnumNum.email]: NotificationTypeEnum.EMAIL,
    [NotificationTypeEnumNum.sms]: NotificationTypeEnum.SMS,
  };
  return mapping[param];
}
