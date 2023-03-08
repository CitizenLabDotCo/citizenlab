import { IInitiativeImageData } from 'api/initiative_images/types';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';

interface InputProps {
  initiativeId: string;
}

type children = (
  renderProps: GetInitiativeImagesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetInitiativeImagesChildProps =
  | IInitiativeImageData[]
  | undefined
  | null;

const GetInitiativeImages = ({ children, initiativeId }: Props) => {
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  return (children as children)(initiativeImages?.data);
};

export default GetInitiativeImages;
