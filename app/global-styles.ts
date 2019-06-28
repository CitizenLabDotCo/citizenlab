import { createGlobalStyle } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-thin.woff2') format('woff2'),
          url('/larsseit-thin.woff') format('woff');
    font-style: normal;
    font-weight: 200;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-thinitalic.woff2') format('woff2'),
          url('/larsseit-thinitalic.woff') format('woff');
    font-style: italic;
    font-weight: 200;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-light.woff2') format('woff2'),
          url('/larsseit-light.woff') format('woff');
    font-style: normal;
    font-weight: 300;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-lightitalic.woff2') format('woff2'),
          url('/larsseit-lightitalic.woff') format('woff');
    font-style: italic;
    font-weight: 300;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit.woff2') format('woff2'),
          url('/larsseit.woff') format('woff');
    font-style: normal;
    font-weight: 400;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-italic.woff2') format('woff2'),
          url('/larsseit-italic.woff') format('woff');
    font-style: italic;
    font-weight: 400;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-medium.woff2') format('woff2'),
          url('/larsseit-medium.woff') format('woff');
    font-style: normal;
    font-weight: 500;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-mediumitalic.woff2') format('woff2'),
          url('/larsseit-mediumitalic.woff') format('woff');
    font-style: italic;
    font-weight: 500;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-bold.woff2') format('woff2'),
          url('/larsseit-bold.woff') format('woff');
    font-style: normal;
    font-weight: 600;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-bolditalic.woff2') format('woff2'),
          url('/larsseit-bolditalic.woff') format('woff');
    font-style: italic;
    font-weight: 600;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-extrabold.woff2') format('woff2'),
          url('/larsseit-extrabold.woff') format('woff');
    font-style: normal;
    font-weight: 800;
  }

  @font-face {
    font-family: 'larsseit';
    src:  url('/larsseit-extrabolditalic.woff2') format('woff2'),
          url('/larsseit-extrabolditalic.woff') format('woff');
    font-style: italic;
    font-weight: 800;
  }

  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  html,
  body {
    background-color: #fff;
    font-size: ${fontSizes.small}px;
    height: 100%;
    position: relative;
    width: 100%;
  }

  html, body, h1, h2, h3, h4, h5, button, input, optgroup, select, textarea {
    font-family: ${(props: any) => props.theme.fontFamily}, 'larsseit', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
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
