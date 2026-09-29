import { ICustomPageData } from './types';

// Only global custom pages are on the Content Builder, mirroring the backend's provisioning
// guard. FAQ, About and project-scoped pages keep their legacy sections.
export function isGlobalCustomPage({
  attributes: { code, project_id },
}: ICustomPageData): boolean {
  return code === 'custom' && !project_id;
}
