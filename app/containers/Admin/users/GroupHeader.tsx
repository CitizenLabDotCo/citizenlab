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
`;

const TitleAndFilters = styled.div``;


const TitleText = styled(T)`
  margin: 0 0 .5em 0;
`;

const FilterLabel = styled.span`
  padding: .25em .5em;
  border: 1px solid ${colors.separation};
  border-radius: 5px;

  & + & {
    margin-left: .5em;
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
  filters: any[];
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
        <TitleAndFilters>
          <TitleText as="h1" value={this.props.title} />
          {this.props.filters.map((filter, index) => (
            <FilterLabel key={index}>{filter}</FilterLabel>
          ))}
        </TitleAndFilters>
        <Button padding=".65em" icon="edit" style="secondary" circularCorners={false} onClick={this.props.onEdit} />
        <Button padding=".65em" icon="delete" style="text" circularCorners={false} onClick={this.props.onDelete} />
        <Spacer />
        <StyledSearch value={this.state.searchValue} onChange={this.handleSearchChange} />
      </TitleWrapper>
    );
  }
}

export default GroupHeader;
