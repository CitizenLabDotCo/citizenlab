import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';

// types
import { Locale } from 'typings';

type Props = {
  selectedLocale: Locale;
};

const ContentBuilderToolbox = ({}: // selectedLocale,
Props) => {
  return (
    <Container>
      <SectionTitle>Widgets</SectionTitle>
    </Container>
  );
};

export default ContentBuilderToolbox;
