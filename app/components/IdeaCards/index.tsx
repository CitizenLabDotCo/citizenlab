import React from 'react';

// components
import IdeaCard, { InputProps as IdeaCardProps } from 'components/IdeaCard';
import IdeasMap from 'components/IdeasMap';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import FeatureFlag from 'components/FeatureFlag';

// resources
import GetIdeas, { GetIdeasChildProps, InputProps as GetIdeasInputProps } from 'utils/resourceLoaders/components/GetIdeas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #e4e4e4;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &.mapView {
    justify-content: flex-end;
  }

  ${media.smallerThanMinTablet`
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    align-items: left;
  `}
`;

const LeftFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const RightFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    display: flex;
    justify-content: space-between;
  `}

  ${media.smallerThanMinTablet`
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
  `}
`;

const DropdownFilters = styled.div`
  &.hidden {
    display: none;
  }

  &.hasViewToggle {
    ${media.smallerThanMinTablet`
      margin-top: 20px;
    `}
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;

  input {
    font-size: 18px;
    font-weight: 400;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
  `}
`;

const ViewButtons = styled.div`
  display: flex;

  &.cardView {
    margin-left: 30px;

    ${media.smallerThanMinTablet`
      margin-left: 0px;
    `}
  }
`;

const ViewButton = styled.div`
  min-width: 85px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  border: solid 1px #e4e4e4;

  &:hover,
  &.active {
    background: #f0f0f0;
  }

  > span {
    color: ${(props) => props.theme.colors.label};
    color: #333;
    font-size: 17px;
    font-weight: 400;
    line-height: 24px;
    padding-left: 15px;
    padding-right: 15px;
  }

  ${media.smallerThanMinTablet`
    height: 44px;
  `}
`;

const CardsButton = ViewButton.extend`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const MapButton = ViewButton.extend`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const IdeasList: any = styled.div`
  margin-left: -13px;
  margin-right: -13px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledIdeaCard = styled<IdeaCardProps>(IdeaCard)`
  flex-grow: 0;
  width: calc(100% * (1/3) - 26px);
  margin-left: 13px;
  margin-right: 13px;

  ${media.smallerThanMaxTablet`
    width: calc(100% * (1/2) - 26px);
  `};

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
`;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  background: #fff;
`;

const IdeaIcon = styled(Icon)`
  height: 45px;
  fill: #999;
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: #999;
  font-size: 18px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
`;

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const LoadMoreButton = styled(Button)``;

interface InputProps extends GetIdeasInputProps  {
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
}

interface Props extends InputProps, GetIdeasChildProps {}

type State = {
  selectedView: 'card' | 'map';
};

class IdeaCards extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedView: 'card'
    };
  }

  loadMore = () => {
    this.props.onLoadMore();
  }

  handleSearchOnChange = (search: string) => {
    this.props.onChangeSearchTerm(search);
  }

  handleSortOnChange = (sort: string) => {
    this.props.onChangeSorting(sort);
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.props.onChangeTopics(topics);
  }

  selectView = (selectedView: 'card' | 'map') => (event: React.FormEvent<any>) => {
    event.preventDefault();
    trackEventByName(tracks.toggleDisplay, { selectedDisplayMode: selectedView });
    this.setState({ selectedView });
  }

  render() {
    const { selectedView } = this.state;
    const { queryParameters, searchValue, ideas, hasMore, querying, loadingMore } = this.props;
    const hasIdeas = (ideas !== null && ideas.data.length > 0);
    const showViewToggle = (this.props.showViewToggle || false);
    const showCardView = (selectedView === 'card');
    const showMapView = (selectedView === 'map');

    return (
      <Container id="e2e-ideas-container">
        <FiltersArea id="e2e-ideas-filters" className={`${showMapView && 'mapView'}`}>
          <LeftFilterArea className={`${showMapView && 'hidden'}`}>
            <StyledSearchInput value={(searchValue || '')} onChange={this.handleSearchOnChange} />
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters className={`${showMapView && 'hidden'} ${showViewToggle && 'hasViewToggle'}`}>
              <SelectSort onChange={this.handleSortOnChange} />
              <SelectTopics onChange={this.handleTopicsOnChange} />
            </DropdownFilters>

            {showViewToggle &&
              <FeatureFlag name="maps">
                <ViewButtons className={`${showCardView && 'cardView'}`}>
                    <CardsButton onClick={this.selectView('card')} className={`${showCardView && 'active'}`}>
                      <FormattedMessage {...messages.cards} />
                    </CardsButton>
                    <MapButton onClick={this.selectView('map')} className={`${showMapView && 'active'}`}>
                      <FormattedMessage {...messages.map} />
                    </MapButton>
                </ViewButtons>
              </FeatureFlag>
            }
          </RightFilterArea>
        </FiltersArea>

        {showCardView && querying &&
          <Loading id="ideas-loading">
            <Spinner size="32px" color="#666" />
          </Loading>
        }

        {!querying && !hasIdeas &&
          <EmptyContainer id="ideas-empty">
            <IdeaIcon name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage {...messages.noIdea} />
              </EmptyMessageLine>
            </EmptyMessage>
            <IdeaButton
              projectId={queryParameters.project}
              phaseId={queryParameters.phase}
            />
          </EmptyContainer>
        }

        {showCardView && !querying && hasIdeas && ideas &&
          <IdeasList id="e2e-ideas-list">
            {ideas.data.map((idea) => (
              <StyledIdeaCard ideaId={idea.id} key={idea.id} />
            ))}
          </IdeasList>
        }

        {showCardView && !querying && hasMore &&
          <LoadMoreButtonWrapper>
            <LoadMoreButton
              onClick={this.loadMore}
              style="secondary"
              size="2"
              text={<FormattedMessage {...messages.loadMore} />}
              processing={loadingMore}
              circularCorners={false}
              fullWidth={true}
              height="60px"
            />
          </LoadMoreButtonWrapper>
        }

        {showMapView && hasIdeas &&
          <IdeasMap projectId={queryParameters.project} phaseId={queryParameters.phase} />
        }
      </Container>
    );
  }
}

export default (inputProps: InputProps) => {
  const { showViewToggle, defaultView, ...getIdeasInputProps } = inputProps;
  const props: GetIdeasInputProps = { ...getIdeasInputProps, type: 'load-more' };

  return (
    <GetIdeas {...props}>
      {(getIdeasChildProps) => <IdeaCards {...inputProps} {...getIdeasChildProps} />}
    </GetIdeas>
  );
};
