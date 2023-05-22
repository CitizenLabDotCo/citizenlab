import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'services/users';

type children = (renderProps: GetAuthUserChildProps) => JSX.Element | null;

interface Props {
  children?: children;
}

export type GetAuthUserChildProps = IUserData | undefined | null;

const GetAuthUser = ({ children }: Props) => {
  const { data: authUser } = useAuthUser();

  return (children as children)(authUser ? authUser.data : null);
};

export default GetAuthUser;
