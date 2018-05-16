// Libraries
import React from 'react';
import { Multiloc } from 'typings';

// Components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import T from 'components/T';
import SearchInput from 'components/UI/SearchInput';

// Styling
import styled from 'styled-components';

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
`;

const TextAndButtons = styled.div`
  margin: 0 0 .5rem 0;

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
export interface Props {
  title: Multiloc;
  smartGroup?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSearch: () => void;
}
export interface State {
  searchValue: string;
}

export class GroupHeader extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }

  handleSearchChange = (newValue) => {
    this.setState({ searchValue: newValue });
  }

  render() {
    return (
      <TitleWrapper>
        {this.props.smartGroup && <TitleIcon name="lightingBolt" />}
        <TextAndButtons>
          <T as="h1" value={this.props.title} />
          <Button padding=".65em" icon="edit" style="secondary" circularCorners={false} onClick={this.props.onEdit} />
          <Button padding=".65em" icon="delete" style="text" circularCorners={false} onClick={this.props.onDelete} />
        </TextAndButtons>
        <Spacer />
        <StyledSearch value={this.state.searchValue} onChange={this.handleSearchChange} />
      </TitleWrapper>
    );
  }
}

export default GroupHeader;
