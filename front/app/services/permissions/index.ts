import { hasPermission } from 'services/permissions/permissions';
import './rules/routePermissions';
import './rules/ideaPermissions';
import './rules/initiativePermissions';
import './rules/commentPermissions';
import './rules/projectPermissions';
import './rules/campaignPermissions';

export { hasPermission };

export * from './permissions';
