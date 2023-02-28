import { IInitiativeImageData } from 'api/initiative_images/types';
import useInitiativeImage from 'api/initiative_images/useInitiativeImage';

interface InputProps {
  initiativeId: string;
  initiativeImageId: string;
  resetOnChange?: boolean;
}

type children = (
  renderProps: GetInitiativeImageChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetInitiativeImageChildProps =
  | IInitiativeImageData
  | undefined
  | null;

const GetInitiativeImage = ({
  children,
  initiativeId,
  initiativeImageId,
}: Props) => {
  const { data: initiativeImage } = useInitiativeImage(
    initiativeId,
    initiativeImageId
  );
  return (children as children)(initiativeImage?.data);
};

export default GetInitiativeImage;
