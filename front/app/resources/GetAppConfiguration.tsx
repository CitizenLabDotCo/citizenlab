import { NilOrError } from 'utils/helperUtils';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export type GetAppConfigurationChildProps = IAppConfigurationData | NilOrError;

type children = (
  renderProps: GetAppConfigurationChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
}

const GetAppConfiguration = ({ children }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  return (children as children)(appConfiguration?.data);
};

export default GetAppConfiguration;
