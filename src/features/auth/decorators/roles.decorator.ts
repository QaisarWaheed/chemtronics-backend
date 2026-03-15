import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Attach allowed roles to a route or controller. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
