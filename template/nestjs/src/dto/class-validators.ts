import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidateIf,
} from 'class-validator';
import { constant } from '../constructs';

@ValidatorConstraint({ async: false })
export class IsEmailOrPhoneNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(text: string, args: ValidationArguments) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 international phone number format

    return emailRegex.test(text) || phoneRegex.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'User must be a valid email address or phone number';
  }
}

export function IsEmailOrPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailOrPhoneNumberConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    const errors: string[] = [];

    if (!/^.{8,20}$/.test(password)) {
      errors.push('Password must be between 8 and 20 characters');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    (args.constraints as any).errors = errors;
    return errors.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return (args.constraints as any).errors.join(', ');
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class ValidS3File implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-.+$/;
    return regex.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid file name`;
  }
}

export function IsValidS3File(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidS3File',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidS3File,
    });
  };
}

export function IsValidMimeType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidMimeType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'string' &&
            constant.acceptedMimeTypes.includes(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `The mime type '${args.value}' is not valid. Accepted mime types are: ${constant.acceptedMimeTypes.join(', ')}.`;
        },
      },
    });
  };
}

// Function to validate if a Base64 string represents a valid file
function isValidBase64File(value: string): boolean {
  // Regular expression to match the beginning of a Base64 data URL
  const regex = /^data:[a-zA-Z0-9/+\+]+;base64,/;
  // Check if the value matches the pattern of a Base64 data URL
  return typeof value === 'string' && regex.test(value);
}

// Custom validator function
export function IsBase64File(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBase64File',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isValidBase64File(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Base64-encoded file.`;
        },
      },
    });
  };
}

// Custom constraint to validate LinkedIn profile URLs
@ValidatorConstraint({ async: false })
export class IsLinkedInUrlConstraint implements ValidatorConstraintInterface {
  validate(linkedInUrl: any, args: ValidationArguments) {
    if (typeof linkedInUrl !== 'string') return false;

    // Regex to match LinkedIn profile URLs
    const linkedInPattern =
      /^https:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9-_/]+$/;
    return linkedInPattern.test(linkedInUrl);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The URL provided is not a valid LinkedIn profile URL.';
  }
}

// Custom decorator
export function IsLinkedInUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLinkedInUrlConstraint,
    });
  };
}

export const RequiredIf = (property: string, dto: any) =>
  ValidateIf((dto) => typeof dto[property] !== 'undefined');

export const RequiredIfValueIs = (property: string, value: any, dto: any) =>
  RequiredIfValueInArray(property, [value], dto);

export const RequiredIfValueInArray = (
  property: string,
  values: any[],
  dto: any,
) =>
  ValidateIf(
    (dto) =>
      typeof dto[property] !== 'undefined' && values.includes(dto[property]),
  );
