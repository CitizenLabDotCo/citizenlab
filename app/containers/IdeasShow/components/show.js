import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';

// components
import ImageCarousel from 'components/ImageCarousel';
import Author from './show/Author';
import Votes from './show/votes';
import Status from './show/Status';
import CommentsLine from './show/CommentsLine';
import SharingLine from './show/SharingLine';
import Comments from './comments';
import T from 'containers/T';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { makeSelectIdeaImages, selectIdea } from '../selectors';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
`;

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

/* eslint-disable */
class Show extends React.PureComponent {

  render() {
    const {
      id, images, authorId, title_multiloc, body_multiloc, created_at, voteId, statusId, comments_count, tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (!title_multiloc) return null;
    return(
      <Container>
        <Helmet
          title={formatMessage(messages.helmetTitle)}
          meta={[
            { name: 'description', content: tFunc(title_multiloc) },
          ]}
        />
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
              <Votes ideaId={id} voteId={voteId} />
              <Status statusId={statusId} />
              <CommentsLine count={comments_count}/>
              <SharingLine location={location} image={images[0] && images[0].attributes.versions.medium} />
            </RightColumn>
          </Content>
        </ContentContainer>
      </Container>
    );
  }

}

Show.propTypes = {
  id: PropTypes.string,
  tFunc: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  idea: selectIdea,
  // idea: (state, props) => state.getIn(['resources', 'ideas', props.id]),
  images: makeSelectIdeaImages(),
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


export default injectIntl(injectTFunc(preprocess(mapStateToProps, null, mergeProps)(Show)));
