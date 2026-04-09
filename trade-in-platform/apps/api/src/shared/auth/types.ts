import { UserRole } from '../types';

export { AuthContext, JwtPayload, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'admin-operation': ['assessment.*', 'customer.*', 'stock.add'],
  'admin-manager': [
    'assessment.view',
    'stock.*',
    'dashboard.*',
    'export.*',
    'pricing.*',
    'catalog.*',
    'test-guide.*',
    'defect-checklist.*',
  ],
  seller: ['price-check.*', 'account.own'],
};
