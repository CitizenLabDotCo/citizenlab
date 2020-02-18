import useProjectHolderOrderings, { InputProps, IOutput } from 'hooks/useProjectHolderOrderings';

export interface GetProjectHolderOrderingsChildProps extends IOutput {}

type children = (renderProps: IOutput) => JSX.Element | null;

const GetProjectHolderOrderings: React.SFC<InputProps> = (props) => {
  const projectHolderOrderings = useProjectHolderOrderings({ pageSize: props.pageSize });
  return (props.children as children)(projectHolderOrderings);
};

export default GetProjectHolderOrderings;
