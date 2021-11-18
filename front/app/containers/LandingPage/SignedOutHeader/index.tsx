import useAppConfiguration from 'hooks/useAppConfiguration';
import React from 'react';
import Layout1 from './Layout1';
import Layout2 from './Layout2';
import Layout3 from './Layout3';
import { isNilOrError } from 'utils/helperUtils';

interface Props {}

const SignedOutHeaderIndex = ({}: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const homepageBannerLayout =
      appConfiguration.data.attributes.settings.core.homepage_banner_layout;

    if (homepageBannerLayout) {
      return {
        layout_1: <Layout1 />,
        layout_2: <Layout2 />,
        layout_3: <Layout3 />,
      }[homepageBannerLayout];
    }
  }

  return null;
};

export default SignedOutHeaderIndex;
