import useAdminPublications, { InputProps, IOutput } from 'hooks/useAdminPublications';
import { omit } from 'lodash-es';

export interface GetAdminPublicationsChildProps extends IOutput {}

type children = (renderProps: IOutput) => JSX.Element | null;

const GetAdminPublications: React.SFC<InputProps> = (props) => {
  const AdminPublications = useAdminPublications(omit(props, 'children'));
  return (props.children as children)(AdminPublications);
};

export default GetAdminPublications;
