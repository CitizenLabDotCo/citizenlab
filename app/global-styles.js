import { injectGlobal } from 'styled-components';
import { fontSize } from 'utils/styleUtils';

import visueltLightEOT from '../assets/fonts/Visuelt-Light.eot';
import visueltLightSVG from '../assets/fonts/Visuelt-Light.svg';
import visueltLightTTF from '../assets/fonts/Visuelt-Light.ttf';
import visueltLightWOFF from '../assets/fonts/Visuelt-Light.woff';
import visueltLightWOFF2 from '../assets/fonts/Visuelt-Light.woff2';

import visueltLightItalicEOT from '../assets/fonts/Visuelt-LightItalic.eot';
import visueltLightItalicSVG from '../assets/fonts/Visuelt-LightItalic.svg';
import visueltLightItalicTTF from '../assets/fonts/Visuelt-LightItalic.ttf';
import visueltLightItalicWOFF from '../assets/fonts/Visuelt-LightItalic.woff';
import visueltLightItalicWOFF2 from '../assets/fonts/Visuelt-LightItalic.woff2';

import visueltRegularEOT from '../assets/fonts/Visuelt-Regular.eot';
import visueltRegularSVG from '../assets/fonts/Visuelt-Regular.svg';
import visueltRegularTTF from '../assets/fonts/Visuelt-Regular.ttf';
import visueltRegularWOFF from '../assets/fonts/Visuelt-Regular.woff';
import visueltRegularWOFF2 from '../assets/fonts/Visuelt-Regular.woff2';

import visueltRegularItalicEOT from '../assets/fonts/Visuelt-Italic.eot';
import visueltRegularItalicSVG from '../assets/fonts/Visuelt-Italic.svg';
import visueltRegularItalicTTF from '../assets/fonts/Visuelt-Italic.ttf';
import visueltRegularItalicWOFF from '../assets/fonts/Visuelt-Italic.woff';
import visueltRegularItalicWOFF2 from '../assets/fonts/Visuelt-Italic.woff2';

import visueltMediumEOT from '../assets/fonts/Visuelt-Medium.eot';
import visueltMediumSVG from '../assets/fonts/Visuelt-Medium.svg';
import visueltMediumTTF from '../assets/fonts/Visuelt-Medium.ttf';
import visueltMediumWOFF from '../assets/fonts/Visuelt-Medium.woff';
import visueltMediumWOFF2 from '../assets/fonts/Visuelt-Medium.woff2';

import visueltMediumItalicEOT from '../assets/fonts/Visuelt-MediumItalic.eot';
import visueltMediumItalicSVG from '../assets/fonts/Visuelt-MediumItalic.svg';
import visueltMediumItalicTTF from '../assets/fonts/Visuelt-MediumItalic.ttf';
import visueltMediumItalicWOFF from '../assets/fonts/Visuelt-MediumItalic.woff';
import visueltMediumItalicWOFF2 from '../assets/fonts/Visuelt-MediumItalic.woff2';

import visueltBoldEOT from '../assets/fonts/Visuelt-Bold.eot';
import visueltBoldSVG from '../assets/fonts/Visuelt-Bold.svg';
import visueltBoldTTF from '../assets/fonts/Visuelt-Bold.ttf';
import visueltBoldWOFF from '../assets/fonts/Visuelt-Bold.woff';
import visueltBoldWOFF2 from '../assets/fonts/Visuelt-Bold.woff2';

import visueltBoldItalicEOT from '../assets/fonts/Visuelt-BoldItalic.eot';
import visueltBoldItalicSVG from '../assets/fonts/Visuelt-BoldItalic.svg';
import visueltBoldItalicTTF from '../assets/fonts/Visuelt-BoldItalic.ttf';
import visueltBoldItalicWOFF from '../assets/fonts/Visuelt-BoldItalic.woff';
import visueltBoldItalicWOFF2 from '../assets/fonts/Visuelt-BoldItalic.woff2';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 300;
    src: url(${visueltLightEOT}); /* IE9 Compat Modes */
    src: url(${visueltLightEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltLightWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltLightWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltLightTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltLightSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 300;
    src: url(${visueltLightItalicEOT}); /* IE9 Compat Modes */
    src: url(${visueltLightItalicEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltLightItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltLightItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltLightItalicTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltLightItalicSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 400;
    src: url(${visueltRegularEOT}); /* IE9 Compat Modes */
    src: url(${visueltRegularEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltRegularWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltRegularWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltRegularTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltRegularSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 400;
    src: url(${visueltRegularItalicEOT}); /* IE9 Compat Modes */
    src: url(${visueltRegularItalicEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltRegularItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltRegularItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltRegularItalicTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltRegularItalicSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 500;
    src: url(${visueltMediumEOT}); /* IE9 Compat Modes */
    src: url(${visueltMediumEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltMediumWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltMediumWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltMediumTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltMediumSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 500;
    src: url(${visueltMediumItalicEOT}); /* IE9 Compat Modes */
    src: url(${visueltMediumItalicEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltMediumItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltMediumItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltMediumItalicTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltMediumItalicSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: normal;
    font-weight: 600;
    src: url(${visueltBoldEOT}); /* IE9 Compat Modes */
    src: url(${visueltBoldEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltBoldWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltBoldWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltBoldTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltBoldSVG}#svgFontName') format('svg'); /* Legacy iOS */
  }

  @font-face {
    font-family: 'visuelt';
    font-style: italic;
    font-weight: 600;
    src: url(${visueltBoldItalicEOT}); /* IE9 Compat Modes */
    src: url(${visueltBoldItalicEOT}?#iefix) format('embedded-opentype'), /* IE6-IE8 */
        url(${visueltBoldItalicWOFF2}) format('woff2'), /* Super Modern Browsers */
        url(${visueltBoldItalicWOFF}) format('woff'), /* Pretty Modern Browsers */
        url(${visueltBoldItalicTTF})  format('truetype'), /* Safari, Android, iOS */
        url('${visueltBoldItalicSVG}#svgFontName') format('svg'); /* Legacy iOS */
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
    height: 100%;
    width: 100%;
    background-color: #fff;
    font-size: ${fontSize('small')};
    position: relative;
  }

  body:not(.fontLoaded) {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'visuelt', 'Helvetica Neue', Helvetica, Arial, sans-serif;

    h1, h2, h3, h4, h5, h6,
    button, input, optgroup, select, textarea,
    .ui.button {
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
