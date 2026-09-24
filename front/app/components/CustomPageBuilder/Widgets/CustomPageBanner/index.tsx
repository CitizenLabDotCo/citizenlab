import React from 'react';

import { UserComponent, useEditor } from '@craftjs/core';

import heroBannerMessages from 'components/admin/BannerFields/messages';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import CustomPageHeader from 'components/CustomPageHeader';

import { FormattedMessage } from 'utils/cl-intl';

import { bannerHasContent } from '../../defaultLayout';

import Settings from './Settings';
import { CustomPageBannerProps } from './types';

// No edit button passed: the page renders its own, since the banner may be absent.
const CustomPageBanner: UserComponent<CustomPageBannerProps> = ({
  image,
  ...content
}) => {
  const { enabled: inBuilder } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const imageUrl = image?.imageUrl ?? null;
  // A banner fresh from the toolbox has nothing to show, and the layouts would render a bare
  // coloured block that reads as broken rather than as unconfigured.
  if (!bannerHasContent({ image, ...content })) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="image">
        <FormattedMessage {...heroBannerMessages.noBannerYet} />
      </WidgetPlaceholder>
    ) : null;
  }

  return <CustomPageHeader banner={{ ...content, imageUrl }} />;
};

CustomPageBanner.craft = {
  props: {},
  related: {
    settings: Settings,
  },
  custom: {
    title: heroBannerMessages.bannerWidgetTitle,
    noPointerEvents: true,
  },
};

export default CustomPageBanner;
