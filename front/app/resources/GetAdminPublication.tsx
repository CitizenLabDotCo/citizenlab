import useAdminPublication from 'hooks/useAdminPublication';
import { memo } from 'react';
import { IAdminPublicationData } from 'services/adminPublications';

export interface GetAdminPublicationChildProps {
  adminPublication: IAdminPublicationData | Error | undefined | null;
}

type Children = (
  renderProps: GetAdminPublicationChildProps
) => JSX.Element | null;

interface Props {
  adminPublicationId: string | null;
  children: Children;
}

const GetAdminPublication = memo(({ adminPublicationId, children }: Props) => {
  const adminPublication = useAdminPublication(adminPublicationId);
  return children({ adminPublication });
});

export default GetAdminPublication;
