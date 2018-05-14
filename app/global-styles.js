import { injectGlobal } from 'styled-components';
import { fontSize } from 'utils/styleUtils';

import visueltLightTTF from 'assets/fonts/Visuelt-Light.ttf';
import visueltLightWOFF from 'assets/fonts/Visuelt-Light.woff';
import visueltLightWOFF2 from 'assets/fonts/Visuelt-Light.woff2';

import visueltLightItalicTTF from 'assets/fonts/Visuelt-LightItalic.ttf';
import visueltLightItalicWOFF from 'assets/fonts/Visuelt-LightItalic.woff';
import visueltLightItalicWOFF2 from 'assets/fonts/Visuelt-LightItalic.woff2';

import visueltRegularTTF from 'assets/fonts/Visuelt-Regular.ttf';
import visueltRegularWOFF from 'assets/fonts/Visuelt-Regular.woff';
import visueltRegularWOFF2 from 'assets/fonts/Visuelt-Regular.woff2';

import visueltRegularItalicTTF from 'assets/fonts/Visuelt-Italic.ttf';
import visueltRegularItalicWOFF from 'assets/fonts/Visuelt-Italic.woff';
import visueltRegularItalicWOFF2 from 'assets/fonts/Visuelt-Italic.woff2';

import visueltMediumTTF from 'assets/fonts/Visuelt-Medium.ttf';
import visueltMediumWOFF from 'assets/fonts/Visuelt-Medium.woff';
import visueltMediumWOFF2 from 'assets/fonts/Visuelt-Medium.woff2';

import visueltMediumItalicTTF from 'assets/fonts/Visuelt-MediumItalic.ttf';
import visueltMediumItalicWOFF from 'assets/fonts/Visuelt-MediumItalic.woff';
import visueltMediumItalicWOFF2 from 'assets/fonts/Visuelt-MediumItalic.woff2';

import visueltBoldTTF from 'assets/fonts/Visuelt-Bold.ttf';
import visueltBoldWOFF from 'assets/fonts/Visuelt-Bold.woff';
import visueltBoldWOFF2 from 'assets/fonts/Visuelt-Bold.woff2';

import visueltBoldItalicTTF from 'assets/fonts/Visuelt-BoldItalic.ttf';
import visueltBoldItalicWOFF from 'assets/fonts/Visuelt-BoldItalic.woff';
import visueltBoldItalicWOFF2 from 'assets/fonts/Visuelt-BoldItalic.woff2';

/* eslint no-unused-expressions: 0 */

export const globalCss = `
  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 300;
    url(${visueltLightWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltLightWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltLightTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 300;
    url(${visueltLightItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltLightItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltLightItalicTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 400;
    url(${visueltRegularWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltRegularWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltRegularTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 400;
    url(${visueltRegularItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltRegularItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltRegularItalicTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 500;
    url(${visueltMediumWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltMediumWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltMediumTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 500;
    url(${visueltMediumItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltMediumItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltMediumItalicTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 600;
    url(${visueltBoldWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltBoldWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltBoldTTF})  format('truetype'), /* Safari, Android, iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 600;
    url(${visueltBoldItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
    url(${visueltBoldItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
    url(${visueltBoldItalicTTF})  format('truetype'), /* Safari, Android, iOS */
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
    font-size: ${fontSize('small')};
    height: 100%;
    position: relative;
    width: 100%;
  }

  body:not(.fontLoaded) {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'visuelt', 'Helvetica Neue', Helvetica, Arial, sans-serif;

    h1, h2, h3, h4, h5, h6, button, input, optgroup, select, textarea, .ui.button {
      font-family: 'visuelt', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
  }

  body.modal-active {
    overflow: hidden;
  }

  p,
  label {
    line-height: 1.5em;
  }

  /* Semantic UI Overrides */
  .ui.message,
  .ui.message.warning,
  .ui.message.info {
    box-shadow: none;
  }
`;

injectGlobal`${globalCss}`;
