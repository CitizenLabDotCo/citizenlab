// Libraries
import React, { memo } from 'react';

// Components
import SearchInput from 'components/UI/SearchInput';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const TitleWrapper = styled.div`
  min-height: 105px;

  h2 {
    padding: 0;
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    color: ${colors.textSecondary};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
  }
`;

export const FirstRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 10px;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const TextAndButtons = styled.div`
  h1 {
    display: inline;
    padding: 0;
    margin: 0;
    margin-right: 10px;
    font-weight: 600;
  }
`;

export const StyledSearchInput = styled(SearchInput)`
  flex: 0 0 250px;
  width: 250px;
`;

interface Props {
  onSearch: (newValue: string) => void;
  title: Record<string, string>;
  subtitle: Record<string, string>;
}

const UsersHeader = memo(({ onSearch, title, subtitle }: Props) => {
  return (
    <TitleWrapper>
      <FirstRow>
        <TextAndButtons>
          <FormattedMessage tagName="h1" {...title} />
        </TextAndButtons>
        <Spacer />
        <StyledSearchInput
          onChange={onSearch}
          // Not important here. Requires quite some refactoring
          // to get users here in a nice and consistent manner.
          // This a11y_... prop needs to be required so we always have it
          // on the citizen side. Whenever this components is touched,
          // you can give it the right value (number of users resulting from the search) here.
          a11y_numberOfSearchResults={0}
        />
      </FirstRow>
      <FormattedMessage tagName="h2" {...subtitle} />
    </TitleWrapper>
  );
});

export default UsersHeader;
