import React from 'react';

// components
import CustomPageHeader from './CustomPageHeader';
import TopInfoSection from './TopInfoSection';
import { Container, Content } from 'containers/LandingPage';

// hooks
import usePage from 'hooks/usePage';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';

import { ICustomPagesAttributes } from 'services/customPages';

const LandingPage = () => {
  const { slug } = useParams() as {
    slug: string;
  };
  const customPage = usePage({ pageSlug: slug });

  if (isNilOrError(customPage)) {
    return null;
  }

  const attributes = customPage.attributes as unknown as ICustomPagesAttributes;
  return (
    <>
      <Container id="e2e-landing-page">
        <CustomPageHeader
          headerLayout={attributes.banner_layout}
          header_bg={attributes.header_bg}
          headerMultiloc={attributes.banner_header_multiloc}
          subheaderMultiloc={attributes.banner_subheader_multiloc}
          headerColor={attributes.banner_overlay_color}
          headerOpacity={attributes.banner_overlay_opacity}
        />
        <Content>
          <TopInfoSection
            multilocContent={attributes.top_info_section_multiloc}
          />
        </Content>
      </Container>
    </>
  );
};

export default LandingPage;
