import { IInitiativeAction } from 'api/initiative_action_descriptors/types';

import useInitiativesPermissions, {
  InitiativePermissionsDisabledReason,
} from 'hooks/useInitiativesPermissions';

import { ActionPermission } from 'utils/actionTakingRules';

type children = (
  renderProps: GetInitiativesPermissionsChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
  action: IInitiativeAction;
}

export type GetInitiativesPermissionsChildProps =
  | ActionPermission<InitiativePermissionsDisabledReason>
  | null
  | undefined;

const GetInitiativesPermissions = ({ children, action }: Props) => {
  const initiativesPermissions = useInitiativesPermissions(action);
  return (children as children)(initiativesPermissions);
};

export default GetInitiativesPermissions;
