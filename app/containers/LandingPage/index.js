import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lighten } from 'polished';

import { Popup } from 'semantic-ui-react';

import { media } from '../../utils/styleUtils';
import headerImage from '../../../assets/img/landingpage/header.png';
import logoImage from '../../../assets/img/landingpage/logo.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f6f6f6;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  positiob: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  background-image: url(${headerImage});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;

  ${media.notPhone`
    height: 305px;
  `}

  ${media.phone`
    min-height: 305px;
  `}
`;

const Logo = styled.img`
  ${media.notPhone`
    width: 100px;
    position: absolute;
    top: 30px;
    left: 30px;
    cursor: pointer;
  `}

  ${media.phone`
    width: 100px;
    margin-top: 30px;
    margin-left: auto;
    margin-right: auto;
  `}
`;

const AddIdeaButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #00a8e2;
  cursor: pointer;
  transition: all 200ms ease-out;

  ${media.notPhone`
    padding: 13px 22px;
    position: absolute;
    top: 30px;
    right: 30px;
  `}

  ${media.phone`
    width: 100%;
    height: 55px;
    margin-top: 35px;
    margin-bottom: 35px;
    margin-left: auto;
    margin-right: auto;
  `}

  &:hover {
    background: ${lighten(0.1, '#00a8e2')};
  }
`;

const AddIdeaButton = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddIdeaButtonIcon = styled.svg`
  fill: #fff;

  ${media.notPhone`
    height: 32px;
    margin-top: -8px;
  `}

  ${media.phone`
    height: 38px;
    margin-top: -8px;
  `}
`;

const AddIdeaButtonText = styled.span`
  color: #fff;
  font-weight: 500;
  font-size: 19px;

  ${media.phone`
    font-size: 22px;
  `}
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 46px;
  line-height: 50px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 120px;
  display: flex;

  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
    padding-top: 130px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
    padding-top: 35px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
`;

const HeaderSubtitle = styled.h2`
  color: #fff;
  font-size: 32px;
  line-height: 36px;
  font-weight: 100;
  text-align: center;
  margin: 0;
  padding: 0;
  opacity: 0.8;

  ${media.tablet`
    font-size: 28px;
    line-height: 32px;
  `}

  ${media.notPhone`
    margin-top: 5px;
  `}

  ${media.phone`
    font-size: 24px;
    line-height: 28px;
  `}

  ${media.smallPhone`
    font-size: 20px;
    line-height: 24px;
  `}
`;

const TabBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
  background: white;
  border-bottom: solid 1px #e0e0e0;

  ${media.phone`
    justify-content: center;
  `}
`;

const TabBarInner = styled.div`
  max-width: 1050px;
  display: flex;

  ${media.notPhone`
    width: 100%;
  `}
`;

const TabLine = styled.div`
  height: 4px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: #00a8e2;
`;

const Tab = styled.div`
  font-size: 19px;
  font-weight: 500;
  color: ${(props) => props.active ? '#00a8e2' : '#444'};
  text-transform: uppercase;
  padding-top: 22px;
  padding-bottom: 22px;
  padding-left: 0px;
  padding-right: 0px;
  cursor: pointer;
  position: relative;
  margin-right: 50px;

  &:hover {
    color: #00a8e2;
  }

  & > ${TabLine} {
    opacity: ${(props) => props.active ? 1 : 0};
  }

  &:last-child {
    margin-right: 0px;
  }

  ${media.phone`
    font-size: 18px;
    margin-right: 40px;
    padding-top: 20px;
    padding-bottom: 20px;
  `}

  ${media.smallPhone`
    font-size: 16px;
    margin-right: 30px;
  `}
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
  padding-bottom: 200px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 80px;
  padding-bottom: 10px;
  /* border: solid 1px purple; */

  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
`;

const SectionTitle = styled.h2`
  flex: 1;
  color: #555;
  font-size: 34px;
  line-height: 38px;
  font-weight: 300;
  margin: 0;
  margin-right: 20px;
  /* border: solid 1px green; */

  ${media.phone`
    font-size: 32px;
    line-height: 36px;
  `}
`;

const ViewAllButton = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  /* border: solid 1px red; */

  &:hover {
    div {
      color: ${lighten(0.1, '#00a8e2')};
    }
  
    svg {
      fill: ${lighten(0.1, '#00a8e2')};
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

const ViewAllButtonText = styled.div`
  color: #00a8e2;
  font-size: 18px;
  line-height: 16px;
  margin-right: 7px;
  /* border: solid 1px red; */
`;

const ViewAllButtonIcon = styled.svg`
  fill: #00a8e2;
  height: 12px;
  margin-top: 0px;
  /* border: solid 1px red; */
`;

const SectionContainer = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;

  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const IdeasContainer = SectionContainer.extend`
  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const Idea = styled.div`
  width: calc(50% - 10px);
  height: 220px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  border: solid 1px #e0e0e0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;

  ${media.phone`
    width: 100%;
    margin-bottom: 20px;
  `}

  ${media.tablet`
    width: calc(50% - 10px);
    margin-bottom: 20px;

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
    /* border-color: #ccc; */
    /* box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.15); */
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.12), 0 15px 45px 0 rgba(0,0,0,0.12);
    transform: scale(1.02);
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

const Project = styled.div`
  width: calc(50% - 10px);
  height: 342px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  border: solid 1px #e0e0e0;
  margin-bottom: 20px;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;

  ${media.phone`
    width: 100%;
    margin-bottom: 20px;
  `}

  ${media.notPhone`
    &:nth-child(even) {
      margin-left: 20px;
    }
  `}

  &:hover {
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.12), 0 15px 45px 0 rgba(0,0,0,0.12);
    transform: scale(1.02);
  }
`;


function LandingPage() { // eslint-disable-line react/prefer-stateless-function
  return (
    <Container>
      <Header>
        <Logo src={logoImage} styleName="logo" alt="logo" />
        <HeaderTitle>Co-create Oostende</HeaderTitle>
        <HeaderSubtitle>Share your ideas for Oostende and co-create your city</HeaderSubtitle>
        <AddIdeaButtonContainer>
          <AddIdeaButton>
            <AddIdeaButtonIcon height="100%" viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0V0z" /><path d="M6.57 21.64c0 .394.32.716.716.716h2.867c.394 0 .717-.322.717-.717v-.718h-4.3v.717zM8.72 8.02C5.95 8.02 3.7 10.273 3.7 13.04c0 1.704.853 3.202 2.15 4.112v1.62c0 .394.322.716.717.716h4.3c.393 0 .716-.322.716-.717v-1.618c1.298-.91 2.15-2.408 2.15-4.113 0-2.768-2.25-5.02-5.017-5.02zm2.04 7.957l-.608.43v1.648H7.286v-1.648l-.61-.43c-.967-.674-1.54-1.77-1.54-2.938 0-1.98 1.605-3.585 3.583-3.585s3.583 1.605 3.583 3.584c0 1.167-.574 2.263-1.542 2.937zM20.3 7.245h-3.61v3.61h-1.202v-3.61h-3.61V6.042h3.61v-3.61h1.202v3.61h3.61v1.203z" />
            </AddIdeaButtonIcon>
            <AddIdeaButtonText>
              Add an idea
            </AddIdeaButtonText>
          </AddIdeaButton>
        </AddIdeaButtonContainer>
      </Header>

      <TabBar>
        <TabBarInner>
          <Tab first active>Overview<TabLine /></Tab>
          <Tab>Ideas<TabLine /></Tab>
          <Tab>Projects<TabLine /></Tab>
        </TabBarInner>
      </TabBar>

      <ContentContainer>
        <Content>
          <SectionHeader>
            <SectionTitle>Ideas for Oostende</SectionTitle>
            <ViewAllButton>
              <ViewAllButtonText>View all ideas</ViewAllButtonText>
              <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
              </ViewAllButtonIcon>
            </ViewAllButton>
          </SectionHeader>
          <SectionContainer>
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
                    content="Retract vote"
                    position="bottom center"
                    size="medium"
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
                    size="medium"
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
                  size="medium"
                  inverted
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
          </SectionContainer>

          <SectionHeader>
            <SectionTitle>Projects from Oostende</SectionTitle>
            <ViewAllButton>
              <ViewAllButtonText>View all projects</ViewAllButtonText>
              <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
              </ViewAllButtonIcon>
            </ViewAllButton>
          </SectionHeader>
          <SectionContainer>
            <Project></Project>
            <Project></Project>
          </SectionContainer>
        </Content>
      </ContentContainer>
    </Container>
  );
}

LandingPage.propTypes = {
  children: PropTypes.any,
};

export default LandingPage;
