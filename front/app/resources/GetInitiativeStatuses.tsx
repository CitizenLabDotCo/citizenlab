import useInitiativeStatuses from 'api/initiative_statuses/useInitiativeStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';

interface InputProps {}

type children = (
  renderProps: GetInitiativeStatusesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetInitiativeStatusesChildProps =
  | IInitiativeStatusData[]
  | undefined
  | null;

const GetInitiativeStatuses = ({ children }: Props) => {
  const { data: initiativeStatuses } = useInitiativeStatuses();

  return (children as children)(initiativeStatuses?.data);
};

export default GetInitiativeStatuses;
