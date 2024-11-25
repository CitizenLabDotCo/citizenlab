import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
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
  // pages/homepage_info/content was the previous bottom info section fragment key,
  // leaving it as such for backwards compatibility
  fragmentName?:
    | 'pages/homepage_info/content'
    | 'pages/homepage_info/top-content';
}

const InfoSection = ({ multilocContent, fragmentName }: Props) => {
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
      <QuillEditedContent>
        {fragmentName ? (
          <Fragment name={fragmentName}>{pageContent}</Fragment>
        ) : (
          pageContent
        )}
      </QuillEditedContent>
    </StyledContentContainer>
  );
};

export default InfoSection;
