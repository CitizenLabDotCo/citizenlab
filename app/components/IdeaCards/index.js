import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// components
import IdeaCard from 'components/IdeaCard';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { mergeJsonApiResources } from 'utils/resources/actions';
import Modal from 'components/UI/Modal';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';
import IdeasShow from 'containers/IdeasShow';
import { Flex, Box } from 'grid-styled';
import ButtonMixin from 'components/admin/StyleMixins/buttonMixin';

// store
import { preprocess } from 'utils';
import { observeIdeas } from 'services/ideas';

// style
import styled from 'styled-components';
import { lighten } from 'polished';

const IdeasList = styled(Flex)`
  margin-top: 10px;
`;

const LoadMoreButton = styled.button`
  background: rgba(34, 34, 34, 0.05);
  color: #6b6b6b;
  flex: 1 0 100%;
  padding: 1.5rem 0;
  text-align: center;

  :hover{
    background: rgba(34, 34, 34, 0.10);
  }
`;

const EmptyContainer = styled.div`
  align-items: center;
  background: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 1.5em;
  justify-content: center;
  margin: 0 10px;
  min-height: 400px;
  padding: 2rem;

  a {
    ${(props) => ButtonMixin(props.theme.colorMain, lighten(0.1, props.theme.colorMain))};
    margin: 1em;
    color: white;

    svg {
      transform: scale(1.5);
    }
  }

  .idea-icon {
    width: 2rem;
    height: 2rem;
    transform: scale(2);
    margin: 0 0 2rem;

    g[fill] {
      fill: #000;
    }
  }

`;

class IdeaCards extends React.Component {

  constructor() {
    super();
    this.ideasSubscription = null;
    this.state = {
      ideas: [],
      currentPage: 1,
      hasMore: false,
      modalIdeaSlug: null,
    };
  }

  componentDidMount() {
    this.resubscribeIdeas();
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEqual(newProps.filter, this.props.filter)) {
      this.setState({
        ideas: [],
        currentPage: 1,
        hasMore: false,
      }, this.resubscribeIdeas);
    }
  }

  resubscribeIdeas() {
    this.unsubscribe();
    this.ideasSubscription = observeIdeas({ queryParameters: {
      ...this.props.filter,
      'page[size]': this.props.filter['page[size]'] || 9,
      'page[number]': this.state.currentPage,
    } }).observable.subscribe((response) => {
      this.setState({
        ideas: [...this.state.ideas, ...response.data],
        hasMore: !!response.links.next,
      });
      // Quite some child components depend on the redux state being loaded.
      // We have to find a more matching solution for this, but at the moment
      // this is the way to make sure they have the data they need.
      this.props.mergeJsonApiResources(response);
    });
  }

  unsubscribe() {
    if (this.ideasSubscription) {
      this.ideasSubscription.unsubscribe();
    }
  }

  loadMoreIdeas = () => {
    this.setState({
      currentPage: this.state.currentPage + 1,
    }, this.resubscribeIdeas);
  }

  closeModal = () => {
    this.setState({
      modalIdeaSlug: null,
    });
  }

  openModal = (slug) => {
    this.setState({
      modalIdeaSlug: slug,
    });
  }

  render() {
    const { ideas, hasMore } = this.state;
    const { loadMoreEnabled } = this.props;

    return (
      <div>
        <IdeasList wrap mx={-10}>
          {ideas.length === 0 &&
            <EmptyContainer>
              <Icon className="idea-icon" name="idea" />
              <FormattedMessage {...messages.empty} />
              <Link to="/ideas/new">
                <Icon name="add_circle" />
                <FormattedMessage {...messages.addIdea} />
              </Link>
            </EmptyContainer>
          }
          {ideas.map((idea) => (
            <Box key={idea.id} w={[1, 1 / 2, 1 / 3]} px={10}>
              <IdeaCard
                id={idea.id}
                onClick={() => this.openModal(idea.attributes.slug)}
              />
            </Box>
          ))}
          {loadMoreEnabled && hasMore &&
            <LoadMoreButton onClick={this.loadMoreIdeas}>
              <FormattedMessage {...messages.loadMore} />
            </LoadMoreButton>
          }
        </IdeasList>
        <Modal
          opened={!!this.state.modalIdeaSlug}
          close={this.closeModal}
          url={`/ideas/${this.state.modalIdeaSlug}`}
        >
          <IdeasShow location={location} slug={this.state.modalIdeaSlug} />
        </Modal>
      </div>
    );
  }
}

IdeaCards.propTypes = {
  filter: PropTypes.object.isRequired,
  mergeJsonApiResources: PropTypes.func.isRequired,
  loadMoreEnabled: PropTypes.bool,
};

IdeaCards.defaultProps = {
  loadMoreEnabled: true,
};

const mapDispatchToProps = {
  mergeJsonApiResources,
};

export default preprocess(null, mapDispatchToProps)(IdeaCards);
