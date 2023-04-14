import { IInitiativeAllowedTransitions } from 'api/initiative_allowed_transitions/types';
import useInitiativeAllowedTransitions from 'api/initiative_allowed_transitions/useInitiativeAllowedTransitions';

interface InputProps {
  id: string;
}

type children = (
  renderProps: GetInitiativeAllowedTransitionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetInitiativeAllowedTransitionsChildProps =
  | IInitiativeAllowedTransitions['data']['attributes']
  | undefined
  | null;

const GetInitiativeAllowedTransitions = ({ id, children }: Props) => {
  const { data: initiativeAllowedTransitions } =
    useInitiativeAllowedTransitions(id);

  if (!initiativeAllowedTransitions) return null;

  return (children as children)(initiativeAllowedTransitions?.data.attributes);
};

export default GetInitiativeAllowedTransitions;
