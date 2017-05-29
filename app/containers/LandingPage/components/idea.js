import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popup } from 'semantic-ui-react';
import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import { selectResourcesDomain } from 'utils/resources/selectors';
import { media } from '../../../utils/styleUtils';

const IdeaContainer = styled.div`
  width: calc(50% - 10px);
  height: 220px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  /* border: solid 1px #e0e0e0; */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;

  ${media.phone`
    width: 100%;
    margin-bottom: 20px;
  `}

  ${media.tablet`
    width: calc(50% - 10px);

    &:nth-child(even) {
      margin-left: 20px;
    }
  `}

  ${media.desktop`
    &:not(:first-child) {
      margin-left: 20px;
    }
  `}

  &:hover {
    /* box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.15); */
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.12), 0 15px 45px 0 rgba(0,0,0,0.12);
    transform: scale(1.01);
  }
`;

const IdeaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const IdeaTitle = styled.div`
  color: #333;
  font-size: 25px;
  font-weight: 300;
  line-height: 30px;
`;

const IdeaMeta = styled.div`
  color: #999;
  font-size: 16px;
  font-weight: 300;
  margin-top: 7px;
`;

const IdeaFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 2px;
`;

const VotesContainer = styled.div`
  display: flex;
`;

const Vote = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 20px;
  }
`;

const VoteUp = Vote.extend`
  &:hover svg {
    fill: #009900;
  }

  &:hover div {
    color: #009900;
  }

  & svg {
    fill: ${(props) => props.voted ? '#009900' : '#999'};
  }

  & div {
    color: ${(props) => props.voted ? '#009900' : '#999'};
  }
`;

const VoteDown = Vote.extend`
  &:hover svg {
    fill: #f30000;
  }

  &:hover div {
    color: #f30000;
  }
`;

const ThumbIcon = styled.svg`
  fill: #aaa;
  height: 26px;
  cursor: pointer;
  display: inline-block;
  align-self: flex-end;

  &:hover {
    fill: #000;
  }
`;

const ThumbUpIcon = ThumbIcon.extend``;

const ThumbDownIcon = ThumbIcon.extend``;

const VoteCount = styled.div`
  color: #aaa;
  font-weight: 300;
  font-size: 16px;
  margin-top: 10px;
  margin-left: 4px;
`;

const CommentContainer = styled.div`
  display: flex;
  position: relative;

  &:hover svg {
    fill: #000;
  }

  &:hover div {
    color: #000;
  }
`;

const CommentIcon = styled.svg`
  fill: #aaa;
  height: 30px;
  cursor: pointer;
  display: inline-block;
  align-self: flex-end;
`;

const CommentCountContainer = styled.div`
  width: 27px;
  height: 22px;
  position: absolute;
  top: 2px;
  left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CommentCount = styled.div`
  color: #aaa;
  font-weight: 300;
  font-size: 14px;
  margin-top: 0px;
`;

class Idea extends React.Component {
  render() {
    return (
      <IdeaContainer onClick={this.props.onClick}>
        <IdeaContent>
          <IdeaTitle>Tunnel underneath the railroad</IdeaTitle>
          <IdeaMeta>3 days ago</IdeaMeta>
        </IdeaContent>
        <IdeaFooter>
          <VotesContainer>
            <Popup
              trigger={
                <VoteUp voted>
                  <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" /><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
                  </ThumbUpIcon>
                  <VoteCount>0</VoteCount>
                </VoteUp>
              }
              content="Retract vote"
              position="bottom center"
              size="small"
              inverted
            />

            <Popup
              trigger={
                <VoteDown>
                  <ThumbDownIcon height="100%" viewBox="0 0 24 24">
                    <path fill="none" d="M0 0h24v24H0V0z" /><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm1 12c0 .268-.103.518-.287.703L9.827 21.59l-.35-.346c-.084-.086-.137-.2-.145-.32l.02-.205.938-4.517.25-1.203H3c-.535 0-.972-.422-1-.95l.002-.01.05-.493-.052-.05V12c0-.125.022-.24.06-.336l3.024-7.06C5.236 4.238 5.596 4 6 4h9c.552 0 1 .45 1 1v10zM19 3v12h4V3h-4zm3 11h-2V4h2v10z" />
                  </ThumbDownIcon>
                  <VoteCount>0</VoteCount>
                </VoteDown>
              }
              content="Vote"
              position="bottom center"
              size="small"
              inverted
            />
          </VotesContainer>
          <Popup
            trigger={
              <CommentContainer>
                <CommentIcon height="100%" viewBox="0 0 24 24">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zm-3.283 13.293L18.414 17H4c-.55 0-1-.448-1-1V4c0-.55.45-1 1-1h16c.546 0 .99.45.99 1L21 19.583l-2.293-2.29z" /><path fill="none" d="M0 0h24v24H0V0z" />
                </CommentIcon>
                <CommentCountContainer>
                  <CommentCount>9</CommentCount>
                </CommentCountContainer>
              </CommentContainer>
            }
            content="View comments"
            position="bottom center"
            size="small"
            inverted
          />
        </IdeaFooter>
      </IdeaContainer>
    );
  }
}

Idea.propTypes = {
  onClick: PropTypes.func,
};

/*
Idea.propTypes = {
  id: PropTypes.string.isRequired,
  idea: PropTypes.any.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain('ideas', id)(state),
});
*/

export default connect(null, null)(Idea);
