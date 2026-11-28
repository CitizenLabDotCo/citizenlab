import React from 'react';

import {
  Box,
  fontSizes,
  isRtl,
  media,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { ICustomPageData } from 'api/custom_pages/types';
import usePageFiles from 'api/page_files/usePageFiles';

import useLocalize from 'hooks/useLocalize';

import ContentContainer from 'components/ContentContainer';
import ResolveTextVariables from 'components/ResolveTextVariables';
import T from 'components/T';
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { isEmptyMultiloc } from 'utils/helperUtils';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';

// The title and attachments styles are copied on purpose from LegacyPageHeader and PageSections,
// which are to be removed.
const PageContainer = styled(ContentContainer)`
  background: ${({ theme }) => theme.colors.white};
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
  background: ${({ theme }) => theme.colors.white};
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
  const theme = useTheme();
  const { data: pageFiles } = usePageFiles(page.id);
  const { title_multiloc, top_info_section_multiloc } = page.attributes;

  return (
    <>
      <PageContainer>
        <Title>{localize(title_multiloc)}</Title>
        <Box zIndex="40000">
          <AdminCustomPageEditButton page={page} />
        </Box>
        {!isEmptyMultiloc(top_info_section_multiloc) && (
          // The same gap below the title as the cookie policy and accessibility statement pages.
          <Box mt="40px">
            <QuillEditedContent textColor={theme.colors.tenantText}>
              <ResolveTextVariables value={top_info_section_multiloc}>
                {(multiloc) => <T value={multiloc} supportHtml={true} />}
              </ResolveTextVariables>
            </QuillEditedContent>
          </Box>
        )}
      </PageContainer>
      {pageFiles && pageFiles.data.length > 0 && (
        <AttachmentsContainer>
          <FileAttachments files={pageFiles.data} />
        </AttachmentsContainer>
      )}
    </>
  );
};

export default PolicyPage;
