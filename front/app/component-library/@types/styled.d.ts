import { MainThemeProps } from '../utils/styleUtils';
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme extends MainThemeProps {}
}
