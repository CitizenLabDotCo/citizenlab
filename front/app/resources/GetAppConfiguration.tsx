// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// typings
import { IAppConfigurationData } from 'services/appConfiguration';
import { NilOrError } from 'utils/helperUtils';

export type GetAppConfigurationChildProps = IAppConfigurationData | NilOrError;

type children = (
  renderProps: GetAppConfigurationChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
}

const GetAppConfiguration = ({ children }: Props) => {
  const appConfiguration = useAppConfiguration();
  return (children as children)(appConfiguration);
};

export default GetAppConfiguration;
