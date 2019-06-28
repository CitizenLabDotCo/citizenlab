import { createGlobalStyle } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const GlobalStyle = createGlobalStyle`
  ${props => props.fonts ?
    `@font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseithhinwoff2}) format('woff2'),
            url(${props.fonts.larsseithhinwoff}) format('woff');
      font-style: normal;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitthinitalicwoff2}) format('woff2'),
            url(${props.fonts.larsseitthinitalicwoff}) format('woff');
      font-style: italic;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitlightwoff2}) format('woff2'),
            url(${props.fonts.larsseitlightwoff}) format('woff');
      font-style: normal;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitlightitalicwoff2}) format('woff2'),
            url(${props.fonts.larsseitlightitalicwoff}) format('woff');
      font-style: italic;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitwoff2}) format('woff2'),
            url(${props.fonts.larsseitwoff}) format('woff');
      font-style: normal;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseititalicwoff2}) format('woff2'),
            url(${props.fonts.larsseititalicwoff}) format('woff');
      font-style: italic;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitmediumwoff2}) format('woff2'),
            url(${props.fonts.larsseitmediumwoff}) format('woff');
      font-style: normal;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitMediumitalicwoff2}) format('woff2'),
            url(${props.fonts.larsseitMediumitalicwoff}) format('woff');
      font-style: italic;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitboldwoff2}) format('woff2'),
            url(${props.fonts.larsseitboldwoff}) format('woff');
      font-style: normal;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitbolditalicwoff2}) format('woff2'),
            url(${props.fonts.larsseitbolditalicwoff}) format('woff');
      font-style: italic;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitextraboldwoff2}) format('woff2'),
            url(${props.fonts.larsseitextraboldwoff}) format('woff');
      font-style: normal;
      font-weight: 800;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitextrabolditalicwoff2}) format('woff2'),
            url(${props.fonts.larsseitextrabolditalicwoff}) format('woff');
      font-style: italic;
      font-weight: 800;
    }`
  : ''}

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
