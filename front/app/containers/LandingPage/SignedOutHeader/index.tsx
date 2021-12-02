import useAppConfiguration from 'hooks/useAppConfiguration';
import React from 'react';
import Layout1 from './Layout1';
import { isNilOrError } from 'utils/helperUtils';
import Outlet from 'components/Outlet';

interface Props {}

const SignedOutHeaderIndex = ({}: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const homepageBannerLayout =
      appConfiguration.data.attributes.settings.customizable_homepage_banner
        ?.layout || 'layout_1';

    if (homepageBannerLayout === 'layout_1') {
      return <Layout1 />;
    }
    <Outlet
      id="app.containers.LandingPage.SignedOutHeader.index"
      homepageBannerLayout={homepageBannerLayout}
    />;
  }

  return null;
};

export default SignedOutHeaderIndex;
