import { fontSizes, isRtl, colors } from '@citizenlab/cl2-component-library';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
  }

  .admin-user-view {
    .weglot_switcher {
      margin-right: 80px !important;
    }
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

  *:focus {
    outline: 4px solid #000000  ;
    outline-offset: 2px ;
    box-shadow: 0 0 0 4px #F9F9F9 ;
  }

  html,
  body {
    background-color: #fff;
    font-size: ${fontSizes.s}px;
    height: 100%;
    position: relative;
    width: 100%;

  ${isRtl`
    text-align: right;
    ul {
        direction: rtl;
    }
  `}
  }

  input, textarea {

    ${isRtl`
        text-align: right;
        direction: rtl;
    `}
    }

  html, body, h1, h2, h3, h4, h5, button, input, optgroup, select, textarea, .ql-container, .ql-toolbar.ql-snow {
    font-family: ${(props) =>
      props.theme
        .fontFamily}, 'Public Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }

  h3 {
    font-weight: 600;
  }

  p,
  label {
    line-height: 1.5em;
  }

  ::placeholder,
  :-ms-input-placeholder,
  ::-webkit-input-placeholder {
    color: ${colors.placeholder};
    opacity: 1; /* Override Firefox's default opacity to provide the same UI for all browsers, See https://ilikekillnerds.com/2014/10/firefox-placeholder-text-looking-lighter-browsers/ */
  }
`;

export default GlobalStyle;
