import { CitizenlabThemeProps } from '@citizenlab/cl2-component-library';
import { IAppConfigurationStyle } from 'api/app_configuration/types';
import 'styled-components';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme
    extends CitizenlabThemeProps,
      IAppConfigurationStyle {}
}
