import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lighten } from 'polished';

import { Popup } from 'semantic-ui-react';

import headerImage from '../../../assets/img/landingpage/header.png';
import logoImage from '../../../assets/img/landingpage/logo.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
`;

const Header = styled.div`
  width: 100%;
  height: 305px;
  display: flex;
  positiob: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url(${headerImage});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
`;

const Logo = styled.img`
  width: 100px;
  position: absolute;
  top: 30px;
  left: 30px;
  cursor: pointer;
`;

const AddIdeaButton = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 19px;
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 14px 20px;
  border-radius: 6px;
  background: #00a8e2;
  cursor: pointer;

  &:hover {
    background: ${lighten(0.2, '#00a8e2')};
  }
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 48px;
  font-weight: 600;
  font-family: 'proxima-nova';
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 90px;
  display: flex;
`;

const HeaderSubtitle = styled.h2`
  color: #fff;
  font-size: 32px;
  font-weight: 100;
  font-family: 'proxima-nova';
  text-align: center;
  margin: 0;
  padding: 0;
  margin-top: 0px;
  opacity: 0.8;
`;

const TabBar = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  background: white;
`;

const TabBarInner = styled.div`
  width: 100%;
  max-width: 1050px;
  display: flex;
  align-items: center;
`;

const TabLine = styled.div`
  height: 4px;
  position: absolute;
  bottom: 0px;
  left: 25px;
  right: 25px;
  background: #00a8e2;
`;

const Tab = styled.div`
  height: 60px;
  font-size: 19px;
  font-weight: 500;
  color: ${(props) => props.active ? '#00a8e2' : '#999'};
  text-transform: uppercase;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 25px;
  padding-right: 25px;
  cursor: pointer;
  position: relative;

  &:first-child {
    padding-left: 0px;
  }

  &:hover {
    color: #00a8e2;
  }

  & > ${TabLine} {
    opacity: ${(props) => props.active ? 1 : 0};
  }

  &:first-child > ${TabLine} {
    left: 0px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1050px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 200px;
  margin-top: 50px;
`;

const IdeasTitle = styled.h2`
  color: #555;
  font-size: 32px;
  font-weight: 600;
  -webkit-font-smoothing: antialiased;
`;

const IdeasContainer = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
`;

const IdeasRow = styled.div`
  display: flex;
  /* justify-content: space-between; */
`;

const Idea = styled.div`
  width: 250px;
  /* width: 30%; */
  height: 220px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  /* transition: box-shadow 500ms cubic-bezier(0.19, 1, 0.22, 1); */
  transition: all 200ms ease;

  &:not(:first-child) {
    margin-left: 20px;
  }

  &:hover {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    /* box-shadow: 0 0 8px 0 rgba(0,0,0,0.12), 0 5px 8px 0 rgba(0,0,0,0.12); */
  }
`;

const IdeaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const IdeaTitle = styled.div`
  color: #444;
  font-size: 25px;
  font-weight: 400;
  line-height: 28px;
`;

const IdeaMeta = styled.div`
  color: #999;
  font-size: 16px;
  font-weight: 400;
  margin-top: 7px;
`;

const IdeaFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 2px;
  /* border-bottom: solid 1px red; */
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
  fill: #999;
  height: 32px;
  cursor: pointer;
  display: inline-block;
  align-self: flex-end;

  &:hover {
    fill: #000;
  }
`;

const ThumbUpIcon = ThumbIcon.extend``;

const ThumbDownIcon = ThumbIcon.extend`
  margin-bottom: -9px;
`;

const VoteCount = styled.div`
  color: #999;
  font-weight: 300;
  font-size: 16px;
  margin-top: 16px;
  margin-left: 3px;
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
  fill: #999;
  height: 34px;
  cursor: pointer;
  display: inline-block;
  align-self: flex-end;
  margin-bottom: -6px;
`;

const CommentCountContainer = styled.div`
  width: 27px;
  height: 22px;
  position: absolute;
  top: 12px;
  left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CommentCount = styled.div`
  color: #999;
  font-weight: 300;
  font-size: 16px;
  margin-top: 0px;
`;

function LandingPage() { // eslint-disable-line react/prefer-stateless-function
  return (
    <Container>
      <Header>
        <Logo src={logoImage} styleName="logo" alt="logo" />
        <AddIdeaButton>Add an idea</AddIdeaButton>
        <HeaderTitle>Co-create Oostende</HeaderTitle>
        <HeaderSubtitle>Share your ideas for Oostende and co-create your city</HeaderSubtitle>
      </Header>

      <TabBar>
        <TabBarInner>
          <Tab first active>Overview<TabLine /></Tab>
          <Tab>Ideas<TabLine /></Tab>
          <Tab>Projects<TabLine /></Tab>
        </TabBarInner>
      </TabBar>

      <ContentContainer>
        <IdeasTitle>Ideas for Oostende</IdeasTitle>
        <IdeasContainer>
          <IdeasRow>
            <Idea>
              <IdeaContent>
                <IdeaTitle>Tunnel underneath the railroad</IdeaTitle>
                <IdeaMeta>3 days ago</IdeaMeta>
              </IdeaContent>
              <IdeaFooter>
                <VotesContainer>
                  {/*
                  <Popup
                    trigger={
                      <VoteUp>
                        <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                          <path fill="none" d="M0 0h24v24H0V0z" /><path d="M1 21h4V9H1v12zm1-11h2v10H2V10zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10zm-1 2c0 .125-.022.24-.06.337l-3.023 7.06c-.153.366-.513.603-.917.603H9c-.55 0-1-.448-1-1V9c0-.267.102-.513.297-.704l5.876-5.885.35.346c.085.085.137.2.145.32l-.018.206-.94 4.514L13.46 9H21c.534 0 .973.42 1 .95l-.002.01-.05.493.052.05V12z" />
                        </ThumbUpIcon>
                        <VoteCount>0</VoteCount>
                      </VoteUp>
                    }
                    content="Vote up"
                    position="bottom center"
                    inverted
                    basic
                  />
                  */}

                  <Popup
                    trigger={
                      <VoteUp voted>
                        <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                          <path d="M0 0h24v24H0z" fill="none" /><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
                        </ThumbUpIcon>
                        <VoteCount>0</VoteCount>
                      </VoteUp>
                    }
                    content="Retract vote up"
                    position="bottom center"
                    inverted
                    basic
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
                    content="Vote down"
                    position="bottom center"
                    inverted
                    basic
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
                  inverted
                  basic
                />
              </IdeaFooter>
            </Idea>

            <Idea>
              <IdeaContent>
                <IdeaTitle>Tunnel underneath the railroad</IdeaTitle>
                <IdeaMeta>3 days ago</IdeaMeta>
              </IdeaContent>
              <IdeaFooter>
                <VotesContainer>
                  <VoteUp>
                    <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M1 21h4V9H1v12zm1-11h2v10H2V10zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10zm-1 2c0 .125-.022.24-.06.337l-3.023 7.06c-.153.366-.513.603-.917.603H9c-.55 0-1-.448-1-1V9c0-.267.102-.513.297-.704l5.876-5.885.35.346c.085.085.137.2.145.32l-.018.206-.94 4.514L13.46 9H21c.534 0 .973.42 1 .95l-.002.01-.05.493.052.05V12z" />
                    </ThumbUpIcon>
                    <VoteCount>0</VoteCount>
                  </VoteUp>
                  <VoteDown>
                    <ThumbDownIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm1 12c0 .268-.103.518-.287.703L9.827 21.59l-.35-.346c-.084-.086-.137-.2-.145-.32l.02-.205.938-4.517.25-1.203H3c-.535 0-.972-.422-1-.95l.002-.01.05-.493-.052-.05V12c0-.125.022-.24.06-.336l3.024-7.06C5.236 4.238 5.596 4 6 4h9c.552 0 1 .45 1 1v10zM19 3v12h4V3h-4zm3 11h-2V4h2v10z" />
                    </ThumbDownIcon>
                    <VoteCount>0</VoteCount>
                  </VoteDown>
                </VotesContainer>
                <CommentContainer>
                  <CommentIcon height="100%" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zm-3.283 13.293L18.414 17H4c-.55 0-1-.448-1-1V4c0-.55.45-1 1-1h16c.546 0 .99.45.99 1L21 19.583l-2.293-2.29z" /><path fill="none" d="M0 0h24v24H0V0z" />
                  </CommentIcon>
                  <CommentCountContainer>
                    <CommentCount>99</CommentCount>
                  </CommentCountContainer>
                </CommentContainer>
              </IdeaFooter>
            </Idea>

            <Idea>
              <IdeaContent>
                <IdeaTitle>Tunnel underneath the railroad</IdeaTitle>
                <IdeaMeta>3 days ago</IdeaMeta>
              </IdeaContent>
              <IdeaFooter>
                <VotesContainer>
                  <VoteUp>
                    <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M1 21h4V9H1v12zm1-11h2v10H2V10zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10zm-1 2c0 .125-.022.24-.06.337l-3.023 7.06c-.153.366-.513.603-.917.603H9c-.55 0-1-.448-1-1V9c0-.267.102-.513.297-.704l5.876-5.885.35.346c.085.085.137.2.145.32l-.018.206-.94 4.514L13.46 9H21c.534 0 .973.42 1 .95l-.002.01-.05.493.052.05V12z" />
                    </ThumbUpIcon>
                    <VoteCount>0</VoteCount>
                  </VoteUp>
                  <VoteDown>
                    <ThumbDownIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm1 12c0 .268-.103.518-.287.703L9.827 21.59l-.35-.346c-.084-.086-.137-.2-.145-.32l.02-.205.938-4.517.25-1.203H3c-.535 0-.972-.422-1-.95l.002-.01.05-.493-.052-.05V12c0-.125.022-.24.06-.336l3.024-7.06C5.236 4.238 5.596 4 6 4h9c.552 0 1 .45 1 1v10zM19 3v12h4V3h-4zm3 11h-2V4h2v10z" />
                    </ThumbDownIcon>
                    <VoteCount>0</VoteCount>
                  </VoteDown>
                </VotesContainer>
                <CommentContainer>
                  <CommentIcon height="100%" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zm-3.283 13.293L18.414 17H4c-.55 0-1-.448-1-1V4c0-.55.45-1 1-1h16c.546 0 .99.45.99 1L21 19.583l-2.293-2.29z" /><path fill="none" d="M0 0h24v24H0V0z" />
                  </CommentIcon>
                  <CommentCountContainer>
                    <CommentCount>999</CommentCount>
                  </CommentCountContainer>
                </CommentContainer>
              </IdeaFooter>
            </Idea>

            <Idea>
              <IdeaContent>
                <IdeaTitle>Tunnel underneath the railroad</IdeaTitle>
                <IdeaMeta>3 days ago</IdeaMeta>
              </IdeaContent>
              <IdeaFooter>
                <VotesContainer>
                  <VoteUp>
                    <ThumbUpIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M1 21h4V9H1v12zm1-11h2v10H2V10zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10zm-1 2c0 .125-.022.24-.06.337l-3.023 7.06c-.153.366-.513.603-.917.603H9c-.55 0-1-.448-1-1V9c0-.267.102-.513.297-.704l5.876-5.885.35.346c.085.085.137.2.145.32l-.018.206-.94 4.514L13.46 9H21c.534 0 .973.42 1 .95l-.002.01-.05.493.052.05V12z" />
                    </ThumbUpIcon>
                    <VoteCount>0</VoteCount>
                  </VoteUp>
                  <VoteDown>
                    <ThumbDownIcon height="100%" viewBox="0 0 24 24">
                      <path fill="none" d="M0 0h24v24H0V0z" /><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm1 12c0 .268-.103.518-.287.703L9.827 21.59l-.35-.346c-.084-.086-.137-.2-.145-.32l.02-.205.938-4.517.25-1.203H3c-.535 0-.972-.422-1-.95l.002-.01.05-.493-.052-.05V12c0-.125.022-.24.06-.336l3.024-7.06C5.236 4.238 5.596 4 6 4h9c.552 0 1 .45 1 1v10zM19 3v12h4V3h-4zm3 11h-2V4h2v10z" />
                    </ThumbDownIcon>
                    <VoteCount>0</VoteCount>
                  </VoteDown>
                </VotesContainer>
                <CommentContainer>
                  <CommentIcon height="100%" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zm-3.283 13.293L18.414 17H4c-.55 0-1-.448-1-1V4c0-.55.45-1 1-1h16c.546 0 .99.45.99 1L21 19.583l-2.293-2.29z" /><path fill="none" d="M0 0h24v24H0V0z" />
                  </CommentIcon>
                  <CommentCountContainer>
                    <CommentCount>0</CommentCount>
                  </CommentCountContainer>
                </CommentContainer>
              </IdeaFooter>
            </Idea>

          </IdeasRow>
        </IdeasContainer>
      </ContentContainer>
    </Container>
  );
}

LandingPage.propTypes = {
  children: PropTypes.any,
};

export default LandingPage;
