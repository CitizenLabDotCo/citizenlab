import React from 'react';

import { UserComponent, useEditor } from '@craftjs/core';

import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import CustomPageHeader from 'components/CustomPageHeader';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';
import { CustomPageBannerProps } from './types';

// Ordinary body content like the homepage's banner: an admin can place, move or delete it.
// The admin edit button is deliberately not passed: the page renders one for itself, since
// the banner may be absent and the title hidden.
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
  const isEmpty =
    !imageUrl && Object.values(content.headerMultiloc).every((text) => !text);

  if (isEmpty) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="image">
        <FormattedMessage {...messages.noBannerYet} />
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
    title: messages.title,
    noPointerEvents: true,
  },
};

export default CustomPageBanner;
