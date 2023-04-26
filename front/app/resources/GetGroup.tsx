import { IGroupData } from 'services/groups';
import useGroup from 'api/groups/useGroup';

interface InputProps {
  id: string;
}

type children = (renderProps: GetGroupChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetGroupChildProps = IGroupData | undefined;

const GetGroup = ({ children, id }: Props) => {
  const { data: group } = useGroup(id);

  return (children as children)(group?.data);
};

export default GetGroup;
