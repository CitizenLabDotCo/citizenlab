import { createGlobalStyle } from 'styled-components';

import { fontSizes, colors } from './utils/styleUtils';

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  * {
    &:not(.focus-visible) {
      outline: none;
    }
  }

  html,
  body {
    background-color: #fff;
    font-size: ${fontSizes.s}px;
    height: 100%;
    position: relative;
    width: 100%;
  }

  html, body, h1, h2, h3, h4, h5, button, input, optgroup, select, textarea, .ql-container, .ql-toolbar.ql-snow {
    font-family: ${(props) =>
      props.theme
        .fontFamily}, 'Public Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }

  ::placeholder,
  :-ms-input-placeholder,
  ::-webkit-input-placeholder {
    color: ${colors.placeholder};
  }
`;

export default GlobalStyle;
