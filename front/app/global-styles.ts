import { createGlobalStyle } from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';

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

  *::placeholder {
    opacity: 1;
    color: #767676;
  }

  html,
  body {
    background-color: #fff;
    font-size: ${fontSizes.small}px;
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
    font-family: ${(props: any) =>
      props.theme
        .fontFamily}, 'larsseit', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }

  h3 {
    font-weight: 600;
  }

  p,
  label {
    line-height: 1.5em;
  }
`;

export default GlobalStyle;
