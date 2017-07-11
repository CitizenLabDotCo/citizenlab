import { injectGlobal } from 'styled-components';

import circularBookEOT from '../assets/fonts/CircularStd-Book.eot';
import circularBookTTF from '../assets/fonts/CircularStd-Book.ttf';
import circularBookWOFF from '../assets/fonts/CircularStd-Book.woff';
import circularBookWOFF2 from '../assets/fonts/CircularStd-Book.woff2';

import circularBookItalicEOT from '../assets/fonts/CircularStd-BookItalic.eot';
import circularBookItalicTTF from '../assets/fonts/CircularStd-BookItalic.ttf';
import circularBookItalicWOFF from '../assets/fonts/CircularStd-BookItalic.woff';
import circularBookItalicWOFF2 from '../assets/fonts/CircularStd-BookItalic.woff2';

import circularBoldEOT from '../assets/fonts/CircularStd-Bold.eot';
import circularBoldTTF from '../assets/fonts/CircularStd-Bold.ttf';
import circularBoldWOFF from '../assets/fonts/CircularStd-Bold.woff';
import circularBoldWOFF2 from '../assets/fonts/CircularStd-Bold.woff2';

import circularBoldItalicEOT from '../assets/fonts/CircularStd-BoldItalic.eot';
import circularBoldItalicTTF from '../assets/fonts/CircularStd-BoldItalic.ttf';
import circularBoldItalicWOFF from '../assets/fonts/CircularStd-BoldItalic.woff';
import circularBoldItalicWOFF2 from '../assets/fonts/CircularStd-BoldItalic.woff2';

import proximaNovaThinEOT from '../assets/fonts/proxima-nova-thin.eot';
import proximaNovaThinTTF from '../assets/fonts/proxima-nova-thin.ttf';
import proximaNovaThinWOFF from '../assets/fonts/proxima-nova-thin.woff';
import proximaNovaThinWOFF2 from '../assets/fonts/proxima-nova-thin.woff2';

import proximaNovaLightEOT from '../assets/fonts/proxima-nova-light.eot';
import proximaNovaLightTTF from '../assets/fonts/proxima-nova-light.ttf';
import proximaNovaLightWOFF from '../assets/fonts/proxima-nova-light.woff';
import proximaNovaLightWOFF2 from '../assets/fonts/proxima-nova-light.woff2';

import proximaNovaRegularEOT from '../assets/fonts/proxima-nova-regular.eot';
import proximaNovaRegularTTF from '../assets/fonts/proxima-nova-regular.ttf';
import proximaNovaRegularWOFF from '../assets/fonts/proxima-nova-regular.woff';
import proximaNovaRegularWOFF2 from '../assets/fonts/proxima-nova-regular.woff2';

import proximaNovaMediumEOT from '../assets/fonts/proxima-nova-medium.eot';
import proximaNovaMediumTTF from '../assets/fonts/proxima-nova-medium.ttf';
import proximaNovaMediumWOFF from '../assets/fonts/proxima-nova-medium.woff';
import proximaNovaMediumWOFF2 from '../assets/fonts/proxima-nova-medium.woff2';

import proximaNovaSemiboldEOT from '../assets/fonts/proxima-nova-semibold.eot';
import proximaNovaSemiboldTTF from '../assets/fonts/proxima-nova-semibold.ttf';
import proximaNovaSemiboldWOFF from '../assets/fonts/proxima-nova-semibold.woff';
import proximaNovaSemiboldWOFF2 from '../assets/fonts/proxima-nova-semibold.woff2';

import proximaNovaBoldEOT from '../assets/fonts/proxima-nova-bold.eot';
import proximaNovaBoldTTF from '../assets/fonts/proxima-nova-bold.ttf';
import proximaNovaBoldWOFF from '../assets/fonts/proxima-nova-bold.woff';
import proximaNovaBoldWOFF2 from '../assets/fonts/proxima-nova-bold.woff2';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  @font-face {
    font-family: 'circular';
    font-style: normal;
    font-weight: 400;
    src: url(${circularBookEOT});
    src: url(${circularBookWOFF2}) format('woff2'),
        url(${circularBookWOFF}) format('woff'),
        url(${circularBookTTF}) format('truetype');
  }

  @font-face {
    font-family: 'circular';
    font-style: italic;
    font-weight: 400;
    src: url(${circularBookItalicEOT});
    src: url(${circularBookItalicWOFF2}) format('woff2'),
        url(${circularBookItalicWOFF}) format('woff'),
        url(${circularBookItalicTTF}) format('truetype');
  }

  @font-face {
    font-family: 'circular';
    font-style: normal;
    font-weight: 600;
    src: url(${circularBoldEOT});
    src: url(${circularBoldWOFF2}) format('woff2'),
        url(${circularBoldWOFF}) format('woff'),
        url(${circularBoldTTF}) format('truetype');
  }

  @font-face {
    font-family: 'circular';
    font-style: italic;
    font-weight: 600;
    src: url(${circularBoldItalicEOT});
    src: url(${circularBoldItalicWOFF2}) format('woff2'),
        url(${circularBoldItalicWOFF}) format('woff'),
        url(${circularBoldItalicTTF}) format('truetype');
  }

  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 100;
    src: url(${proximaNovaThinEOT});
    src: url(${proximaNovaThinWOFF2}) format('woff2'),
        url(${proximaNovaThinWOFF}) format('woff'),
        url(${proximaNovaThinTTF}) format('truetype');
  }

  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 300;
    src: url(${proximaNovaLightEOT});
    src: url(${proximaNovaLightWOFF2}) format('woff2'),
        url(${proximaNovaLightWOFF}) format('woff'),
        url(${proximaNovaLightTTF}) format('truetype');
  }

  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 400;
    src: url(${proximaNovaRegularEOT});
    src: url(${proximaNovaRegularWOFF2}) format('woff2'),
        url(${proximaNovaRegularWOFF}) format('woff'),
        url(${proximaNovaRegularTTF}) format('truetype');
  }

  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 500;
    src: url(${proximaNovaMediumEOT});
    src: url(${proximaNovaMediumWOFF2}) format('woff2'),
        url(${proximaNovaMediumWOFF}) format('woff'),
        url(${proximaNovaMediumTTF}) format('truetype');
  }

  @font-face {
  font-family: 'proxima-nova';
  font-style: normal;
  font-weight: 600;
  src: url(${proximaNovaSemiboldEOT});
  src: url(${proximaNovaSemiboldWOFF2}) format('woff2'),
      url(${proximaNovaSemiboldWOFF}) format('woff'),
      url(${proximaNovaSemiboldTTF}) format('truetype');
  }

  @font-face {
  font-family: 'proxima-nova';
  font-style: normal;
  font-weight: 700;
  src: url(${proximaNovaBoldEOT});
  src: url(${proximaNovaBoldWOFF2}) format('woff2'),
      url(${proximaNovaBoldWOFF}) format('woff'),
      url(${proximaNovaBoldTTF}) format('truetype');
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded, body.fontLoaded * {
    font-family: 'circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.modal-active {
    overflow: hidden;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.5em;
  }

  .button, .badge, .label {
    margin-right: 5px;
  }

  .clIdeaShowDialog {
    top: 70px !important;
    right: 0 !important;
    left: unset !important;
    min-height: 100%;
    width: 80% !important;
  }

`;
