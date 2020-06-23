// Libraries
import React, { PureComponent } from 'react';
import { Multiloc } from 'typings';

// Components
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';
import T from 'components/T';
import SearchInput from 'components/UI/SearchInput';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Styling
import styled from 'styled-components';
import rgba from 'polished/lib/color/rgba';
import { colors, fontSizes } from 'utils/styleUtils';

const TitleWrapper = styled.div`
  min-height: 105px;

  h2 {
    padding: 0;
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    color: ${colors.adminSecondaryTextColor};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
  }
`;

const FirstRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 10px;
`;

const OnlyRow = styled(FirstRow)`
  min-height: 105px;
  margin-bottom: 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const TitleIcon = styled(Icon)`
  flex: 0 0 56px;
  width: 56px;
  height: 47px;
  margin-right: 10px;
  margin-left: -15px;

  .cl-icon-primary {
    fill: ${colors.adminOrangeIcons};
  }

  .cl-icon-background {
    fill: ${rgba(colors.adminOrangeIcons, .1)};
  }
`;

const TextAndButtons = styled.div`
  h1 {
    display: inline;
    padding: 0;
    margin: 0;
    margin-right: 10px;
    font-weight: 600;
  }
`;

const Buttons = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  transform: scale(0.9);
`;

const StyledSearchInput = styled(SearchInput)`
  flex: 0 0 250px;
  width: 250px;
  margin-top: -10px;
`;

interface Props {
  title?: Multiloc;
  smartGroup?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch: (newValue: string) => void;
}
interface State {}

interface Tracks {
  trackSearchInput: Function;
}

class UsersHeader extends PureComponent<Props & Tracks, State> {
  handleSearchChange = (newValue: string) => {
    this.props.onSearch(newValue);
  }

  render() {
    if (this.props.title) {
      return (
        <OnlyRow>
          {this.props.smartGroup && <TitleIcon name="lightingBolt" />}
          <TextAndButtons>
            <T as="h1" value={this.props.title} />
            <Buttons>
              <Button iconTitle={<FormattedMessage {...messages.editGroup} />} hiddenText={<FormattedMessage {...messages.editGroup} />} padding=".65em" icon="edit" buttonStyle="secondary" onClick={this.props.onEdit} />
              <Button iconTitle={<FormattedMessage {...messages.deleteGroup} />} hiddenText={<FormattedMessage {...messages.deleteGroup} />} padding=".65em" icon="delete" buttonStyle="text" onClick={this.props.onDelete} />
            </Buttons>
          </TextAndButtons>
          <Spacer />
          <StyledSearchInput onChange={this.handleSearchChange} />
        </OnlyRow>
      );
    }

    return (
      <TitleWrapper>
        <FirstRow>
          <TextAndButtons>
            <FormattedMessage tagName="h1" {...messages.allUsers} />
          </TextAndButtons>
          <Spacer />
          <StyledSearchInput onChange={this.handleSearchChange} />
        </FirstRow>
        <FormattedMessage tagName="h2" {...messages.usersSubtitle} />
      </TitleWrapper>
    );
  }
}

export default injectTracks<Props>({
  trackSearchInput: tracks.searchInput,
})(UsersHeader);
