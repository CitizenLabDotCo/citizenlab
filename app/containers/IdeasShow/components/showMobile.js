import React from 'react';
import PropTypes from 'prop-types';

import { injectTFunc } from 'components/T/utils';
import styled from 'styled-components';

// components
import ImageCarousel from 'components/ImageCarousel';
import Author from './show/Author';
import StatusBadge from 'components/StatusBadge';
import SharingLine from './show/SharingLine';
import Comments from './comments';
import T from 'components/T';
import VoteControl from 'components/VoteControl';

// store
import { preprocess } from 'utils';
import { selectIdeaImages, selectIdea } from '../selectors';

// intl
import { injectIntl, intlShape } from 'react-intl';

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
  margin: 50px 0px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 15px;
  padding-right: 15px;
`;

const Content = styled.div`
  width: 100%;
  max-width: 1050px;
  display: flex;
  flex-direction: column;
`;

const SeparatorRow = styled.div`
  height: 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const IdeaTitle = styled.h1`
  font-size: 25px;
  margin: 12px 0;
`;

const IdeaBody = styled.div`
  font-size: 18px;
  color: #8f8f8f;
`;

const StyledAuthor = styled(Author)`
  margin: 15px 0;
`;
const StyledVoteControl = styled(VoteControl)`
  margin: 15px 0;
`;

const StyledStatusBadge = styled(StatusBadge)`
  margin: 15px 0;
  margin-right: auto;
`;

/* eslint-disable */
class ShowMobile extends React.PureComponent {

  render() {
    const {
      id, images, authorId, title_multiloc, body_multiloc, created_at, voteId, statusId, comments_count, tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (!title_multiloc) return null;

    return (
      <Container>
        <ContentContainer>
          <Content>
            <StyledAuthor authorId={authorId} createdAt={created_at} />
            <StyledVoteControl ideaId={id} size="medium" />
            <IdeaTitle><T value={title_multiloc} /></IdeaTitle>
              <StyledStatusBadge statusId={statusId} />
            {/* <Carousel images={images.map((image) => image.attributes.versions)} /> */}
            <IdeaBody>
              <T value={body_multiloc} />
            </IdeaBody>
            <SeparatorRow />
            <SharingLine location={location} image={images[0] && images[0].attributes.versions.medium} />
            <Comments ideaId={id} />
          </Content>
        </ContentContainer>
      </Container>
    );
  }

}

ShowMobile.propTypes = {
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


export default injectIntl(injectTFunc(preprocess(mapStateToProps, null, mergeProps)(ShowMobile)));
