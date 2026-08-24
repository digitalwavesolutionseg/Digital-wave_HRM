import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from "class-validator";

export const PASSWORD_POLICY = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
};

export function validatePasswordPolicy(password: string): string | null {
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    return `Password must be at least ${PASSWORD_POLICY.minLength} characters long`;
  }
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (PASSWORD_POLICY.requireDigit && !/\d/.test(password)) {
    return "Password must contain at least one digit";
  }
  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}

@ValidatorConstraint({ name: "strongPassword", async: false })
export class StrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && validatePasswordPolicy(value) === null;
  }

  defaultMessage(args: ValidationArguments): string {
    return validatePasswordPolicy(String(args.value)) ?? "Password does not meet the security policy";
  }
}

export function IsStrongPassword() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      validator: StrongPasswordConstraint,
    });
  };
}
