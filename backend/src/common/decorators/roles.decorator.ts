import { SetMetadata } from "@nestjs/common";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  HR = "HR",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  RECRUITER = "RECRUITER",
  EMPLOYEE = "EMPLOYEE",
}

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
