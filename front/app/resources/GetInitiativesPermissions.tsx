import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';
import { ActionPermission } from 'services/actionTakingRules';
import { IInitiativeAction } from 'services/initiatives';

type children = (
  renderProps: GetInitiativesPermissionsChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
  action: IInitiativeAction;
}

export type GetInitiativesPermissionsChildProps =
  | ActionPermission<IInitiativeDisabledReason>
  | null
  | undefined;

const GetInitiativesPermissions = ({ children, action }: Props) => {
  const initiativesPermissions = useInitiativesPermissions(action);
  return (children as children)(initiativesPermissions);
};

export default GetInitiativesPermissions;
