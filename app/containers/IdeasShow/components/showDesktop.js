import React from 'react';
import PropTypes from 'prop-types';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';

// components
import ImageCarousel from 'components/ImageCarousel';
import Author from './show/Author';
import StatusBadge from 'components/StatusBadge';
import CommentsLine from './show/CommentsLine';
import SharingLine from './show/SharingLine';
import Comments from './comments';
import T from 'containers/T';
import VoteControl from 'components/VoteControl';
import ContentContainer from 'components/ContentContainer';


// store
import { preprocess } from 'utils';
import { selectIdeaImages, selectIdea } from '../selectors';

// intl
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import messages from './../messages';

const Carousel = ({ images }) => {
  if (!images[0]) return null;
  return <ImageCarousel ideaImages={images} />;
};

Carousel.propTypes = {
  images: PropTypes.array.isRequired,
};

const Content = styled.div`
  width: 100%;
  max-width: 1050px;
  display: flex;
`;

const LeftColumn = styled.div`
  flex-grow: 1;
  padding: 55px;
`;

const SeparatorColumn = styled.div`
  flex: 0 0 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const SeparatorRow = styled.div`
  height: 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const RightColumn = styled.div`
  flex: 0 0 280px;
  padding: 40px;
`;

const IdeaTitle = styled.h1`
  font-size: 25px;
  padding-bottom: 1.5em;
`;
const IdeaBody = styled.div`
  font-size: 18px;
  color: #8f8f8f;
`;

const VoteCTA = styled.h3`
  font-size: 20px;
  font-weight: 400;
  color: #222222;
`;

const StatusContainer = styled.div`
  padding: 50px 0;
`;

const StatusTitle = styled.h4`
  font-size: 18px;
  color: #a6a6a6;
  font-weight: 400;
`;

/* eslint-disable */
class ShowDesktop extends React.PureComponent {

  render() {
    const {
      id, images, authorId, title_multiloc, body_multiloc, created_at, voteId, statusId, comments_count, tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (!title_multiloc) return null;

    return (
      <ContentContainer>
        <Content>
          <LeftColumn>
            <Author authorId={authorId} createdAt={created_at} />
            <IdeaTitle><T value={title_multiloc} /></IdeaTitle>
            <Carousel images={images.map((image) => image.attributes.versions)} />
            <IdeaBody>
              <T value={body_multiloc} />
            </IdeaBody>
            <SeparatorRow />
            <Comments ideaId={id} />
          </LeftColumn>
          <SeparatorColumn />
          <RightColumn>
            <VoteCTA>
              <FormattedMessage {...messages.voteCTA} />
            </VoteCTA>
            <VoteControl ideaId={id} size="large" />
            <StatusContainer>
              <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
              <StatusBadge statusId={statusId} />
            </StatusContainer>
            <CommentsLine count={comments_count}/>
            <SharingLine location={location} image={images[0] && images[0].attributes.versions.medium} />
          </RightColumn>
        </Content>
      </ContentContainer>
    );
  }

}

ShowDesktop.propTypes = {
  id: PropTypes.string,
  slug: PropTypes.string,
  tFunc: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  idea: selectIdea(state, props),
  images: selectIdeaImages(state, props),
});

/* eslint-disable camelcase*/

const mergeProps = ({ idea, images }, dispatchProps, { tFunc, location, intl }) => {
  if (!idea) return {
    intl,
  };

  const attributes = idea.get('attributes').toObject();
  const id = idea.get('id')
  const {
    body_multiloc,
    created_at,
    downvotes_count,
    title_multiloc,
    upvotes_count,
    comments_count,
  } = attributes;
  const relationships = idea.get('relationships');

  const getIds = (val, key) => val.get('id');
  const authorId = relationships.getIn(['author', 'data', 'id']);
  const areas = relationships.getIn(['areas','data']).map(getIds);
  const topics = relationships.getIn(['topics','data']).map(getIds);
  const voteId = relationships.getIn(['user_vote', 'data', 'id']);
  const statusId = relationships.getIn(['idea_status', 'data', 'id']);

  return {
    id,
    images: images && images.toJS(),
    body_multiloc,
    created_at,
    votes: downvotes_count + upvotes_count,
    comments_count,
    title_multiloc,
    authorId,
    areas,
    topics,
    location,
    voteId,
    statusId,
    tFunc,
    intl,
  };

};


export default injectIntl(injectTFunc(preprocess(mapStateToProps, null, mergeProps)(ShowDesktop)));
