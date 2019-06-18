import { createGlobalStyle } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
// import {
//   larsseitThinTTF,
//   larsseitThinWOFF,
//   larsseitThinWOFF2,
//   larsseitThinItalicTTF,
//   larsseitThinItalicWOFF,
//   larsseitThinItalicWOFF2,
//   larsseitLightTTF,
//   larsseitLightWOFF,
//   larsseitLightWOFF2,
//   larsseitLightItalicTTF,
//   larsseitLightItalicWOFF,
//   larsseitLightItalicWOFF2,
//   larsseitRegularTTF,
//   larsseitRegularWOFF,
//   larsseitRegularWOFF2,
//   larsseitRegularItalicTTF,
//   larsseitRegularItalicWOFF,
//   larsseitRegularItalicWOFF2,
//   larsseitMediumTTF,
//   larsseitMediumWOFF,
//   larsseitMediumWOFF2,
//   larsseitMediumItalicTTF,
//   larsseitMediumItalicWOFF,
//   larsseitMediumItalicWOFF2,
//   larsseitBoldTTF,
//   larsseitBoldWOFF,
//   larsseitBoldWOFF2,
//   larsseitBoldItalicTTF,
//   larsseitBoldItalicWOFF,
//   larsseitBoldItalicWOFF2,
//   larsseitExtraBoldTTF,
//   larsseitExtraBoldWOFF,
//   larsseitExtraBoldWOFF2,
//   larsseitExtraBoldItalicTTF,
//   larsseitExtraBoldItalicWOFF,
//   larsseitExtraBoldItalicWOFF2
// } from './fonts';

const GlobalStyle = async () => {
  const fonts = await import(
    /* webpackPreload: true */'./fonts'
  );

  const {
    larsseitThinTTF,
    larsseitThinWOFF,
    larsseitThinWOFF2,
    larsseitThinItalicTTF,
    larsseitThinItalicWOFF,
    larsseitThinItalicWOFF2,
    larsseitLightTTF,
    larsseitLightWOFF,
    larsseitLightWOFF2,
    larsseitLightItalicTTF,
    larsseitLightItalicWOFF,
    larsseitLightItalicWOFF2,
    larsseitRegularTTF,
    larsseitRegularWOFF,
    larsseitRegularWOFF2,
    larsseitRegularItalicTTF,
    larsseitRegularItalicWOFF,
    larsseitRegularItalicWOFF2,
    larsseitMediumTTF,
    larsseitMediumWOFF,
    larsseitMediumWOFF2,
    larsseitMediumItalicTTF,
    larsseitMediumItalicWOFF,
    larsseitMediumItalicWOFF2,
    larsseitBoldTTF,
    larsseitBoldWOFF,
    larsseitBoldWOFF2,
    larsseitBoldItalicTTF,
    larsseitBoldItalicWOFF,
    larsseitBoldItalicWOFF2,
    larsseitExtraBoldTTF,
    larsseitExtraBoldWOFF,
    larsseitExtraBoldWOFF2,
    larsseitExtraBoldItalicTTF,
    larsseitExtraBoldItalicWOFF,
    larsseitExtraBoldItalicWOFF2
  } = fonts;

  return createGlobalStyle`
    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitThinWOFF2}) format('woff2'),
            url(${larsseitThinWOFF}) format('woff'),
            url(${larsseitThinTTF}) format('truetype');
      font-style: normal;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitThinItalicWOFF2}) format('woff2'),
            url(${larsseitThinItalicWOFF}) format('woff'),
            url(${larsseitThinItalicTTF}) format('truetype');
      font-style: italic;
      font-weight: 200;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitLightWOFF2}) format('woff2'),
            url(${larsseitLightWOFF}) format('woff'),
            url(${larsseitLightTTF}) format('truetype');
      font-style: normal;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitLightItalicWOFF2}) format('woff2'),
            url(${larsseitLightItalicWOFF}) format('woff'),
            url(${larsseitLightItalicTTF}) format('truetype');
      font-style: italic;
      font-weight: 300;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitRegularWOFF2}) format('woff2'),
            url(${larsseitRegularWOFF}) format('woff'),
            url(${larsseitRegularTTF}) format('truetype');
      font-style: normal;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitRegularItalicWOFF2}) format('woff2'),
            url(${larsseitRegularItalicWOFF}) format('woff'),
            url(${larsseitRegularItalicTTF}) format('truetype');
      font-style: italic;
      font-weight: 400;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitMediumWOFF2}) format('woff2'),
            url(${larsseitMediumWOFF}) format('woff'),
            url(${larsseitMediumTTF}) format('truetype');
      font-style: normal;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitMediumItalicWOFF2}) format('woff2'),
            url(${larsseitMediumItalicWOFF}) format('woff'),
            url(${larsseitMediumItalicTTF}) format('truetype');
      font-style: italic;
      font-weight: 500;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitBoldWOFF2}) format('woff2'),
            url(${larsseitBoldWOFF}) format('woff'),
            url(${larsseitBoldTTF}) format('truetype');
      font-style: normal;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitBoldItalicWOFF2}) format('woff2'),
            url(${larsseitBoldItalicWOFF}) format('woff'),
            url(${larsseitBoldItalicTTF}) format('truetype');
      font-style: italic;
      font-weight: 600;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitExtraBoldWOFF2}) format('woff2'),
            url(${larsseitExtraBoldWOFF}) format('woff'),
            url(${larsseitExtraBoldTTF}) format('truetype');
      font-style: normal;
      font-weight: 800;
    }

    @font-face {
      font-family: 'larsseit';
      src:  url(${larsseitExtraBoldItalicWOFF2}) format('woff2'),
            url(${larsseitExtraBoldItalicWOFF}) format('woff'),
            url(${larsseitExtraBoldItalicTTF}) format('truetype');
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

};

export default GlobalStyle;
