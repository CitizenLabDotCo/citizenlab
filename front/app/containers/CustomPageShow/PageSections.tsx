import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ICustomPageData } from 'api/custom_pages/types';
import usePageFiles from 'api/page_files/usePageFiles';

import ContentContainer from 'components/ContentContainer';
import InfoSection from 'components/LandingPages/citizen/InfoSection';
import FileAttachments from 'components/UI/FileAttachments';

import { isNilOrError } from 'utils/helperUtils';

import CustomPageProjectsAndEvents from './CustomPageProjectsAndEvents';

const AttachmentsContainer = styled(ContentContainer)<{
  topInfoSectionEnabled: boolean;
}>`
  background: #fff;
  padding-top: ${({ topInfoSectionEnabled }) =>
    topInfoSectionEnabled ? '0' : '50px'};
  padding-bottom: 50px;
  padding-left: 20px;
  padding-right: 20px;

  ${media.tablet`
    padding-top: 30px;
    padding-bottom: 30px;
  `}
`;

type Props = {
  page: ICustomPageData;
};

// The fixed sections a custom page is built from before the Content Builder: two info
// sections, its attachments and its projects/events list, each behind its own toggle. A page
// on the builder renders its layout instead, so this whole component — and the toggles that
// feed it — goes away at cutover.
const PageSections = ({ page }: Props) => {
  const { data: remotePageFiles } = usePageFiles(page.id);
  const attributes = page.attributes;

  return (
    <>
      {attributes.top_info_section_enabled && (
        <InfoSection multilocContent={attributes.top_info_section_multiloc} />
      )}
      {attributes.files_section_enabled &&
        !isNilOrError(remotePageFiles) &&
        remotePageFiles.data.length > 0 && (
          <AttachmentsContainer
            topInfoSectionEnabled={attributes.top_info_section_enabled}
          >
            <FileAttachments files={remotePageFiles.data} />
          </AttachmentsContainer>
        )}
      <CustomPageProjectsAndEvents page={page} />
      {attributes.bottom_info_section_enabled &&
        attributes.bottom_info_section_multiloc && (
          <InfoSection
            multilocContent={attributes.bottom_info_section_multiloc}
          />
        )}
    </>
  );
};

export default PageSections;
