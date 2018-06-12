// Libraries
import React from 'react';
import { Multiloc } from 'typings';
import { throttle } from 'lodash';

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
  align-items: flex-start;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  margin-bottom: 5rem;

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
  margin: .5rem 0;

  h1 {
    display: inline;
  }

  > .Button {
    display: inline-block;
    margin-left: 1rem;
  }
`;

const StyledSearch = styled(SearchInput)`
  align-self: flex-start;
  flex: 0 0 225px;
  justify-self: flex-end;
`;

const Spacer = styled.div`
  flex: 1 1 0;
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

class UsersHeader extends React.PureComponent<Props & Tracks, State> {
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
            <Button iconTitle={<FormattedMessage {...messages.editGroup} />} hiddenText={<FormattedMessage {...messages.editGroup} />} padding=".65em" icon="edit" style="secondary" circularCorners={false} onClick={this.props.onEdit} />
            <Button iconTitle={<FormattedMessage {...messages.deleteGroup} />} hiddenText={<FormattedMessage {...messages.deleteGroup} />} padding=".65em" icon="delete" style="text" circularCorners={false} onClick={this.props.onDelete} />
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
