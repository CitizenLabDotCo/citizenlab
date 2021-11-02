import { FC } from 'react';
import useAdminPublications, {
  InputProps as HookProps,
  IUseAdminPublicationsOutput,
} from 'hooks/useAdminPublications';
import { omit } from 'lodash-es';
import useAdminPublicationsPrefetchProjects from 'hooks/useAdminPublicationPrefetchProjects';

export interface GetAdminPublicationsChildProps
  extends IUseAdminPublicationsOutput {}

type children = (
  renderProps: IUseAdminPublicationsOutput
) => JSX.Element | null;

interface Props extends HookProps {
  prefetchProjects?: boolean;
}

const GetAdminPublications: FC<Props> = (props) => {
  let adminPublications: IUseAdminPublicationsOutput;
  if (props.prefetchProjects) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    adminPublications = useAdminPublicationsPrefetchProjects(
      omit(props, ['children', 'prefetchProjects'])
    );
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    adminPublications = useAdminPublications(
      omit(props, ['children', 'prefetchProjects'])
    );
  }
  return (props.children as children)(adminPublications);
};

export default GetAdminPublications;
