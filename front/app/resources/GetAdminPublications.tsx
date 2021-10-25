import { FC } from 'react';
import useAdminPublications, {
  InputProps,
  IUseAdminPublicationsOutput,
} from 'hooks/useAdminPublications';
import { omit } from 'lodash-es';

export interface GetAdminPublicationsChildProps
  extends IUseAdminPublicationsOutput {}

type children = (
  renderProps: IUseAdminPublicationsOutput
) => JSX.Element | null;

const GetAdminPublications: FC<InputProps> = (props) => {
  const adminPublications: IUseAdminPublicationsOutput = useAdminPublications(
    omit(props, ['children'])
  );

  return (props.children as children)(adminPublications);
};

export default GetAdminPublications;
