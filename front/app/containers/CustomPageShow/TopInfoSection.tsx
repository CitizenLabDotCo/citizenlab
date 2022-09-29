import React from 'react';
import { isEmptyMultiloc } from 'utils/helperUtils';
import T from 'components/T';

// typings
import { Multiloc } from 'typings';
import {
  CustomSectionContentContainer,
  StyledQuillEditedContent,
} from 'containers/LandingPage/HomepageInfoSection';

type Props = {
  multilocContent: Multiloc;
};

const CustomPageTopInfoSection = ({ multilocContent }: Props) => {
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  return (
    <CustomSectionContentContainer>
      <StyledQuillEditedContent>
        <T value={multilocContent} supportHtml={true} />
      </StyledQuillEditedContent>
    </CustomSectionContentContainer>
  );
};

export default CustomPageTopInfoSection;
