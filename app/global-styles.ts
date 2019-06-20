import { createGlobalStyle } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const GlobalStyle = createGlobalStyle`
  ${props => props.fonts ?
    `@font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitThinWOFF2}) format('woff2'),
            url(${props.fonts.larsseitThinWOFF}) format('woff');
      font-style: normal;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitThinItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitThinItalicWOFF}) format('woff');
      font-style: italic;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitLightWOFF2}) format('woff2'),
            url(${props.fonts.larsseitLightWOFF}) format('woff');
      font-style: normal;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitLightItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitLightItalicWOFF}) format('woff');
      font-style: italic;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitRegularWOFF2}) format('woff2'),
            url(${props.fonts.larsseitRegularWOFF}) format('woff');
      font-style: normal;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitRegularItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitRegularItalicWOFF}) format('woff');
      font-style: italic;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitMediumWOFF2}) format('woff2'),
            url(${props.fonts.larsseitMediumWOFF}) format('woff');
      font-style: normal;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitMediumItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitMediumItalicWOFF}) format('woff');
      font-style: italic;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitBoldWOFF2}) format('woff2'),
            url(${props.fonts.larsseitBoldWOFF}) format('woff');
      font-style: normal;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitBoldItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitBoldItalicWOFF}) format('woff');
      font-style: italic;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitExtraBoldWOFF2}) format('woff2'),
            url(${props.fonts.larsseitExtraBoldWOFF}) format('woff');
      font-style: normal;
      font-weight: 800;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${props.fonts.larsseitExtraBoldItalicWOFF2}) format('woff2'),
            url(${props.fonts.larsseitExtraBoldItalicWOFF}) format('woff');
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
