import React from 'react';

import {
  Box,
  fontSizes,
  isRtl,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ICustomPageData } from 'api/custom_pages/types';
import usePageFiles from 'api/page_files/usePageFiles';

import useLocalize from 'hooks/useLocalize';

import ContentContainer from 'components/ContentContainer';
import InfoSection from 'components/LandingPages/citizen/InfoSection';
import FileAttachments from 'components/UI/FileAttachments';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';

// Copied on purpose from LegacyPageHeader and PageSections, which are to be removed, so these two
// pages keep their look.
const TitleContainer = styled(ContentContainer)`
  background: #fff;
  padding: 50px;

  ${media.tablet`
    padding: 50px 20px;
  `}
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  hyphens: auto;
  overflow-wrap: break-word;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const AttachmentsContainer = styled(ContentContainer)`
  background: #fff;
  padding: 0 20px 50px;

  ${media.tablet`
    padding-top: 30px;
    padding-bottom: 30px;
  `}
`;

type Props = {
  page: ICustomPageData;
};

// The terms and privacy pages: a title, the body edited in Settings → Policies, and any
// attachments.
const PolicyPage = ({ page }: Props) => {
  const localize = useLocalize();
  const { data: pageFiles } = usePageFiles(page.id);
  const { title_multiloc, top_info_section_multiloc } = page.attributes;

  return (
    <>
      <TitleContainer>
        <Title>{localize(title_multiloc)}</Title>
        <Box zIndex="40000">
          <AdminCustomPageEditButton pageId={page.id} />
        </Box>
      </TitleContainer>
      <InfoSection multilocContent={top_info_section_multiloc} />
      {pageFiles && pageFiles.data.length > 0 && (
        <AttachmentsContainer>
          <FileAttachments files={pageFiles.data} />
        </AttachmentsContainer>
      )}
    </>
  );
};

export default PolicyPage;
