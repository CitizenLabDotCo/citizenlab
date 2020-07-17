import useAdminPublications, {
  InputProps as HookProps,
  IOutput,
} from 'hooks/useAdminPublications';
import { omit } from 'lodash-es';
import useAdminPublicationsPrefetchProjects from 'hooks/useAdminPublicationPrefetchProjects';

export interface GetAdminPublicationsChildProps extends IOutput {}

type children = (renderProps: IOutput) => JSX.Element | null;

interface Props extends HookProps {
  prefetchProjects?: boolean;
}

const GetAdminPublications: React.SFC<Props> = (props) => {
  let adminPublications: IOutput;
  if (props.prefetchProjects) {
    adminPublications = useAdminPublicationsPrefetchProjects(
      omit(props, ['children', 'prefetchProjects'])
    );
  } else {
    adminPublications = useAdminPublications(
      omit(props, ['children', 'prefetchProjects'])
    );
  }
  return (props.children as children)(adminPublications);
};

export default GetAdminPublications;
