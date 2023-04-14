import useInitiativeMarkers from 'api/initiative_markers/useInitiativeMarkers';
import { IGeotaggedInitiativeData } from 'api/initiative_markers/types';

interface InputProps {}

type children = (
  renderProps: GetInitiativeMarkersChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetInitiativeMarkersChildProps =
  | IGeotaggedInitiativeData[]
  | undefined
  | null;

const GetInitiativeMarkers = ({ children }: Props) => {
  const { data: initiativeMarkers } = useInitiativeMarkers();

  return (children as children)(initiativeMarkers?.data);
};

export default GetInitiativeMarkers;
