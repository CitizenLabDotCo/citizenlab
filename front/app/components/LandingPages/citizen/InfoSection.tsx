import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import ContentContainer from 'components/ContentContainer';
import ResolveTextVariables from 'components/ResolveTextVariables';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { isEmptyMultiloc } from 'utils/helperUtils';

const StyledContentContainer = styled(ContentContainer)`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
  padding-bottom: 50px;
  background: #fff;

  ${media.tablet`
    padding-top: 30px;
    padding-bottom: 30px;
  `}
`;

interface Props {
  multilocContent: Multiloc;
}

const InfoSection = ({ multilocContent }: Props) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  // needed for backwards compatibility with old-style custom pages
  // see PagesShowPage/index.tsx on an older commit for more info
  // this won't be needed for bottom info section
  const pageContent = (
    <ResolveTextVariables value={multilocContent}>
      {(multiloc) => <T value={multiloc} supportHtml={true} />}
    </ResolveTextVariables>
  );

  return (
    <StyledContentContainer>
      <QuillEditedContent>{pageContent}</QuillEditedContent>
    </StyledContentContainer>
  );
};

export default InfoSection;
