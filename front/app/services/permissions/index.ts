import { hasPermission } from 'services/permissions/permissions';
import './rules/campaignPermissions';
import './rules/commentPermissions';
import './rules/ideaPermissions';
import './rules/initiativePermissions';
import './rules/projectPermissions';
import './rules/routePermissions';

export * from './permissions';
export { hasPermission };
