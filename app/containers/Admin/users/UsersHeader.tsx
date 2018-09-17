// Libraries
import React, { PureComponent } from 'react';
import { Multiloc } from 'typings';
import { throttle } from 'lodash-es';

// Components
import Icon from 'components/UI/Icon';
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
import { colors } from 'utils/styleUtils';

const gutter = '.5rem';

const TitleWrapper = styled.div`
  min-height: 95px;
  align-items: flex-start;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-left: -${gutter};
  margin-right: -${gutter};

  > * {
    padding-left: ${gutter};
    padding-right: ${gutter};
  }
`;

const TitleIcon = styled(Icon)`
  flex: 0 0 calc(3rem + 2 * ${gutter});

  .cl-icon-primary {
    fill: ${colors.adminOrangeIcons};
  }

  .cl-icon-background {
    fill ${rgba(colors.adminOrangeIcons, .1)}
  }
`;

const TextAndButtons = styled.div`
  h1 {
    margin-left: 10px;
    margin-right: 10px;
    display: inline;
  }
`;

const Buttons = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  transform: scale(0.9);
`;

const StyledSearch = styled(SearchInput)`
  margin-top: -10px;
  align-self: flex-start;
  flex: 0 0 225px;
  justify-self: flex-end;
`;

const Spacer = styled.div`
  flex: 1 0 auto;
`;

// Typings
interface Props {
  title?: Multiloc;
  smartGroup?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch: (newValue: string) => void;
}
interface State {
  searchValue: string;
}

interface Tracks {
  trackSearchInput: Function;
}

class UsersHeader extends PureComponent<Props & Tracks, State> {
  debounceSearch: (newValue: string) => void;

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };

    this.debounceSearch = throttle(this.props.onSearch, 500);
  }

  handleSearchChange = (newValue) => {
    this.setState({ searchValue: newValue });
    this.debounceSearch(newValue);
  }

  focusSearch = () => {
    this.props.trackSearchInput();
  }

  render() {
    if (this.props.title) {
    return (
        <TitleWrapper>
          {this.props.smartGroup && <TitleIcon name="lightingBolt" />}
          <TextAndButtons>
            <T as="h1" value={this.props.title} />
            <Buttons>
              <Button iconTitle={<FormattedMessage {...messages.editGroup} />} hiddenText={<FormattedMessage {...messages.editGroup} />} padding=".65em" icon="edit" style="secondary" circularCorners={false} onClick={this.props.onEdit} />
              <Button iconTitle={<FormattedMessage {...messages.deleteGroup} />} hiddenText={<FormattedMessage {...messages.deleteGroup} />} padding=".65em" icon="delete" style="text" circularCorners={false} onClick={this.props.onDelete} />
            </Buttons>
          </TextAndButtons>
          <Spacer />
          <StyledSearch value={this.state.searchValue} onChange={this.handleSearchChange} onFocus={this.focusSearch} />
        </TitleWrapper>
      );
    }
    return (
      <TitleWrapper>
        <TextAndButtons>
          <FormattedMessage tagName="h1" {...messages.allUsers} />
        </TextAndButtons>
        <Spacer />
        <StyledSearch value={this.state.searchValue} onChange={this.handleSearchChange} />
      </TitleWrapper>
    );
  }
}

export default injectTracks<Props>({
  trackSearchInput: tracks.searchInput,
})(UsersHeader);
