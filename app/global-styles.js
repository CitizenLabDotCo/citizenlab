import { injectGlobal } from 'styled-components';

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

  /*
  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 800;
    src: url(assets/fonts/proxima-nova-extra-bold.eot);
    src: url(assets/fonts/proxima-nova-extra-bold.eot?#iefix) format('embedded-opentype'),
        url(assets/fonts/proxima-nova-extra-bold.woff2) format('woff2'),
        url(assets/fonts/proxima-nova-extra-bold.woff) format('woff'),
        url(assets/fonts/proxima-nova-extra-bold.ttf) format('truetype');
  }

  @font-face {
    font-family: 'proxima-nova';
    font-style: normal;
    font-weight: 900;
    src: url(assets/fonts/proxima-nova-black.eot);
    src: url(assets/fonts/proxima-nova-black.eot?#iefix) format('embedded-opentype'),
        url(assets/fonts/proxima-nova-black.woff2) format('woff2'),
        url(assets/fonts/proxima-nova-black.woff) format('woff'),
        url(assets/fonts/proxima-nova-black.ttf) format('truetype');
  }
  */

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
    font-family: 'proxima-nova', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
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
