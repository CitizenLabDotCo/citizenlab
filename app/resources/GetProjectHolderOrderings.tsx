import useProjectHolderOrderings, { InputProps, IOutput } from 'hooks/useProjectHolderOrderings';
import { omit } from 'lodash-es';

export interface GetProjectHolderOrderingsChildProps extends IOutput {}

type children = (renderProps: IOutput) => JSX.Element | null;

const GetProjectHolderOrderings: React.SFC<InputProps> = (props) => {
  const projectHolderOrderings = useProjectHolderOrderings(omit(props, 'children'));
  return (props.children as children)(projectHolderOrderings);
};

export default GetProjectHolderOrderings;
