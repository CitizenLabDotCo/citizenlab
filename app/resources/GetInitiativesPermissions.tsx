import { IInitiativeAction } from 'services/initiatives';
import { ActionPermission } from 'services/actionTakingRules';
import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';

interface InputProps {}

type children = (
  renderProps: GetInitiativesPermissionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  action: IInitiativeAction;
}

export type GetInitiativesPermissionsChildProps =
  | ActionPermission<IInitiativeDisabledReason>
  | undefined;

export default ({ children, action }: Props) => {
  const initiativesPermissions = useInitiativesPermissions(action);
  return (children as children)(initiativesPermissions);
};
