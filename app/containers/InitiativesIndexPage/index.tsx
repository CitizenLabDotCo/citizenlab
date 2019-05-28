import React, { memo } from 'react';

// components
import Footer from 'components/Footer';
import InitiativesIndexMeta from './InitiativesIndexMeta';
import ShouldBeInitiatives from './ShouldBeInitiatives';
import SuccessStories from './SuccessStories';

// i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

// style
// import styled from 'styled-components';
// import { media, fontSizes, colors } from 'utils/styleUtils';

export default memo(() => (
  <>
    <InitiativesIndexMeta />
    <SuccessStories />
    <ShouldBeInitiatives />
    <Footer />
  </>
));
