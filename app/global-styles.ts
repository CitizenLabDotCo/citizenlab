import { injectGlobal } from 'styled-components';
import { fontSize } from 'utils/styleUtils';
import {
  visueltLightTTF,
  visueltLightWOFF,
  visueltLightWOFF2,
  visueltLightItalicTTF,
  visueltLightItalicWOFF,
  visueltLightItalicWOFF2,
  visueltRegularTTF,
  visueltRegularWOFF,
  visueltRegularWOFF2,
  visueltRegularItalicTTF,
  visueltRegularItalicWOFF,
  visueltRegularItalicWOFF2,
  visueltMediumTTF,
  visueltMediumWOFF,
  visueltMediumWOFF2,
  visueltMediumItalicTTF,
  visueltMediumItalicWOFF,
  visueltMediumItalicWOFF2,
  visueltBoldTTF,
  visueltBoldWOFF,
  visueltBoldWOFF2,
  visueltBoldItalicTTF,
  visueltBoldItalicWOFF,
  visueltBoldItalicWOFF2
} from './fonts';

export default injectGlobal`
  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltLightWOFF2}) format('woff2'),
          url(${visueltLightWOFF}) format('woff'),
          url(${visueltLightTTF}) format('truetype');
    font-style: normal;
    font-weight: 300;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltLightItalicWOFF2}) format('woff2'),
          url(${visueltLightItalicWOFF}) format('woff'),
          url(${visueltLightItalicTTF}) format('truetype');
    font-style: italic;
    font-weight: 300;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltRegularWOFF2}) format('woff2'),
          url(${visueltRegularWOFF}) format('woff'),
          url(${visueltRegularTTF}) format('truetype');
    font-style: normal;
    font-weight: 400;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltRegularItalicWOFF2}) format('woff2'),
          url(${visueltRegularItalicWOFF}) format('woff'),
          url(${visueltRegularItalicTTF}) format('truetype');
    font-style: italic;
    font-weight: 400;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltMediumWOFF2}) format('woff2'),
          url(${visueltMediumWOFF}) format('woff'),
          url(${visueltMediumTTF}) format('truetype');
    font-style: normal;
    font-weight: 500;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltMediumItalicWOFF2}) format('woff2'),
          url(${visueltMediumItalicWOFF}) format('woff'),
          url(${visueltMediumItalicTTF}) format('truetype');
    font-style: italic;
    font-weight: 500;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltBoldWOFF2}) format('woff2'),
          url(${visueltBoldWOFF}) format('woff'),
          url(${visueltBoldTTF}) format('truetype');
    font-style: normal;
    font-weight: 600;
  }

  @font-face {
    font-family: 'visuelt';
    src:  url(${visueltBoldItalicWOFF2}) format('woff2'),
          url(${visueltBoldItalicWOFF}) format('woff'),
          url(${visueltBoldItalicTTF}) format('truetype');
    font-style: italic;
    font-weight: 600;
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
    font-family: 'visuelt', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: ${fontSize('small')};
    height: 100%;
    position: relative;
    width: 100%;
  }

  body.modal-active {
    overflow: hidden;
  }

  p,
  label {
    line-height: 1.5em;
  }
`;
