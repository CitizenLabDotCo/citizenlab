import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { Locale } from 'typings';

type children = (
  renderProps: GetAppConfigurationLocalesChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
}

export type GetAppConfigurationLocalesChildProps = Locale[] | undefined;

const GetAppConfigurationLocales = (props: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationLocales =
    appConfiguration?.data?.attributes?.settings?.core?.locales;

  return (props.children as children)(appConfigurationLocales);
};

export default GetAppConfigurationLocales;
