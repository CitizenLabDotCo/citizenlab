import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { FormattedMessage, FormattedRelative } from 'react-intl';

// components
import T from 'containers/T';
import { Link } from 'react-router';
import Icon from 'components/UI/Icon';
import VoteControl from 'components/VoteControl';
import UnAuthenticated from './components/UnAuthenticated';

// style
import styled, { keyframes } from 'styled-components';
import placeholder from './placeholder.png';

import messages from './messages';

const IdeaContainer = styled(Link)`
  width: 100%;
  height: 400px;
  margin: 0 0 26px 0;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;
  position: relative;

  &:hover {
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);
  }
`;

const fadeIn = keyframes`
  0% { display:none ; opacity: 0; }
  1% { display: flex ; opacity: 0; }
  100% { display: flex ; opacity: 1; }
`;

const IdeaHoverBar = styled.div`
  background: rgba(0,0,0,0.65);
  height: 60px;
  position: absolute;
  top: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #ffffff;
  padding: 20px;
  border-radius: 5px 5px 0 0;

  display: none;
  opacity: 0;

  ${IdeaContainer}:hover & {
    animation: ${fadeIn} 0.15s ease-out;
    display: flex;
    opacity: 1;
  }
`;

const CommentCount = styled.span`
  padding-left: 6px;
`;

const IdeaImage = styled.img`
  width: 100%;
  height: 168px;
  object-fit:cover;
  border-radius: 5px 5px 0 0;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const IdeaFooter = styled.div`
  padding: 20px;
`;

const IdeaTitle = styled.h4`
  color: #222222;
  font-weight: bold;
  // Multi-line wrap, adapted from https://codepen.io/martinwolf/pen/qlFdp
  display: block; /* Fallback for non-webkit */
  display: -webkit-box;
  max-width: 400px;
  height: ${(props) => props.lines * props.lineHeight * props.fontSize}px; /* Fallback for non-webkit */
  margin: 0 auto;
  font-size: ${(props) => props.fontSize}px;
  line-height: ${(props) => props.lineHeight};
  -webkit-line-clamp: ${(props) => props.lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IdeaAuthor = styled.div`
  color: #6B6B6B;
  font-size: 16px;
  font-weight: 300;
  margin-top: 12px;
  // a {
  //   color: #6B6B6B;
  //   &:hover {
  //     color: #222222;
  //   }
  // }
`;

// We use <span> instead of Link, because the whole card is already
// a Link (more important for SEO) and <a> tags can not be nested
const AuthorLink = styled.span`
  color: #6B6B6B;
  &:hover {
    color: #222222;
  }
`;


class View extends React.Component {

  constructor() {
    super();
    this.state = {
      showUnauthenticated: false,
    };
  }
  onCardClick = (event) => {
    event.preventDefault();
    this.props.onClick();
  }

  onAuthorClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.props.push(`/profile/${this.props.authorSlug}`);
  }

  onVoteClick = () => {
    if (!this.props.isAuthenticated) {
      this.setState({
        showUnauthenticated: true,
      });
    }
    return this.props.isAuthenticated;
  }

  render() {
    const { title, createdAt, ideaId, commentsCount, imageUrl, authorName, slug } = this.props;
    const { showUnauthenticated } = this.state;

    return (
      <IdeaContainer onClick={this.onCardClick} to={`/ideas/${slug}`}>
        <IdeaHoverBar>
          <FormattedRelative value={createdAt} />
          <div>
            <Icon name="comment" />
            <CommentCount>{commentsCount}</CommentCount>
          </div>
        </IdeaHoverBar>
        <IdeaImage src={imageUrl || placeholder} />
        <IdeaContent>
          <IdeaTitle lines={2} lineHeight={1.4} fontSize={23}>
            <T value={title} />
          </IdeaTitle>
          <IdeaAuthor>
            <FormattedMessage
              {...messages.byAuthorLink}
              values={{
                authorLink: <AuthorLink onClick={this.onAuthorClick}>{authorName}</AuthorLink>,
              }}
            />
          </IdeaAuthor>
        </IdeaContent>
        {!showUnauthenticated &&
          <IdeaFooter>
            <VoteControl ideaId={ideaId} beforeVote={this.onVoteClick} />
          </IdeaFooter>
        }
        {showUnauthenticated && <UnAuthenticated />}
      </IdeaContainer>
    );
  }
}

View.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: ImPropTypes.map,
  createdAt: PropTypes.string.isRequired,
  ideaId: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  authorId: PropTypes.string,
  authorSlug: PropTypes.string,
  authorName: PropTypes.string.isRequired,
  commentsCount: PropTypes.number,
  push: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default connect(null, { push })(View);
