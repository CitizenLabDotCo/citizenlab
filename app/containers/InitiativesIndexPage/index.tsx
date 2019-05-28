import React, { memo } from 'react';

// components
import Footer from 'components/Footer';
import InitiativesIndexMeta from './InitiativesIndexMeta';
import InitiativesHeader from './InitiativesHeader';
import SuccessStories from './SuccessStories';
import ShouldBeInitiatives from './ShouldBeInitiatives';

// i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

// style
// import styled from 'styled-components';
// import { media, fontSizes, colors } from 'utils/styleUtils';

export default memo(() => (
  <>
    <InitiativesIndexMeta />
    <InitiativesHeader />
    <SuccessStories />
    <ShouldBeInitiatives />
    <Footer />
  </>
));
