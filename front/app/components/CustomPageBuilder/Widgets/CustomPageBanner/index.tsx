import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import { useSectionBoundaryMargin } from 'components/admin/ContentBuilder/verticalRhythm';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import CustomPageHeader from 'components/CustomPageHeader';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';
import { CustomPageBannerProps } from './types';

// The admin edit button is deliberately not passed: the page renders one for itself, since
// the banner may be absent and the title hidden.
const CustomPageBanner: UserComponent<CustomPageBannerProps> = ({
  image,
  ...content
}) => {
  const { enabled: inBuilder } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const marginBottom = useSectionBoundaryMargin();

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

  return (
    <Box mb={marginBottom}>
      <CustomPageHeader banner={{ ...content, imageUrl }} />
    </Box>
  );
};

CustomPageBanner.craft = {
  props: {},
  related: {
    settings: Settings,
  },
  // Pinned above the body like the title, but a page may have no banner at all, so this one
  // is deletable and can be dragged back from the toolbox.
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.title,
    noPointerEvents: true,
  },
};

export default CustomPageBanner;
