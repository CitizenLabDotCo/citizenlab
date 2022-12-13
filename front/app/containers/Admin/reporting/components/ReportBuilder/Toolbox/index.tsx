import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';

// TODO remove
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// types
import { Locale } from 'typings';

type Props = {
  selectedLocale: Locale;
};

const ContentBuilderToolbox = (
  _: // selectedLocale,
  Props
) => {
  return (
    <Container>
      <SectionTitle>Widgets</SectionTitle>
      <DraggableElement
        id="e2e-draggable-two-column"
        component={<TwoColumn columnLayout="1-1" />}
        icon="layout-2column-1"
        label={'Two column'}
      />
    </Container>
  );
};

export default ContentBuilderToolbox;
