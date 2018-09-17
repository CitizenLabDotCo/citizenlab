// libs
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// utils
import eventEmitter from 'utils/eventEmitter';
import { IModalInfo } from 'containers/App';

// components
import T from 'components/T';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import VoteControl from 'components/VoteControl';
import Unauthenticated from './Unauthenticated';
import VotingDisabled from 'components/VoteControl/VotingDisabled';

// resources
import GetIdea from 'resources/GetIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, media, fontSize } from 'utils/styleUtils';
import { lighten } from 'polished';

const Wrapper = styled.div`
  align-items: strech;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 30px;
  position: relative;
`;

const Title = styled.h2``;

const Description = styled.div`
  flex: 1 1 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;

  &::after {
    background: linear-gradient(0deg, white, rgba(255, 255, 255, 0));
    bottom: 0;
    content: "";
    display: block;
    height: 3rem;
    left: 0;
    right: 0;
    position: absolute;
  }
`;

const VoteComments = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
const StyledButton = styled(Button)`
  justify-self: flex-end;
`;

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSize('base')};
`;

const CloseIcon = styled(Icon)`
  height: 13px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 20px;
  right: 20px;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

// Typings
export interface Props {
  idea: string;
  className?: string;
  onClose?: {(event): void};
}

type State = {
  showFooter: 'unauthenticated' | 'votingDisabled' | null;
};

export default class IdeaBox extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showFooter: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.idea !== prevProps.idea) {
      this.setState({
        showFooter: null,
      });
    }
  }

  createIdeaClickHandler = (idea) => (event) => {
    event.preventDefault();
    event.stopPropagation();

    eventEmitter.emit<IModalInfo>('projectIdeasMap', 'cardClick', {
      type: 'idea',
      id: idea.id,
      url: `/ideas/${idea.attributes.slug}`
    });
  }

  handleUnauthenticatedVoteClick = () => {
    this.setState({ showFooter: 'unauthenticated' });
  }

  handleDisabledVoteClick = () => {
    this.setState({ showFooter: 'votingDisabled' });
  }

  render() {
    const { showFooter } = this.state;

    return (
      <GetIdea id={this.props.idea}>
        {(idea) => {
          if (isNilOrError(idea)) return null;

          return (
            <Wrapper className={this.props.className}>
              {this.props.onClose &&
                <CloseButton onClick={this.props.onClose}>
                  <CloseIcon name="close3" />
                </CloseButton>
              }
              <Title><T value={idea.attributes.title_multiloc} /></Title>
              <Description>
                <T as="div" value={idea.attributes.body_multiloc} supportHtml />
              </Description>
              <VoteComments>
                {!showFooter &&
                  <>
                    <VoteControl
                      ideaId={idea.id}
                      size="1"
                      unauthenticatedVoteClick={this.handleUnauthenticatedVoteClick}
                      disabledVoteClick={this.handleDisabledVoteClick}
                    />
                    <CommentsCount>
                      <Icon name="comments" />
                      {idea.attributes.comments_count}
                    </CommentsCount>
                  </>
                }
                {showFooter === 'unauthenticated' &&
                  <Unauthenticated />
                }
                {showFooter === 'votingDisabled' &&
                  <VotingDisabled
                    votingDescriptor={idea.relationships.action_descriptor.data.voting}
                    projectId={idea.relationships.project.data.id}
                  />
                }
              </VoteComments>
              <StyledButton circularCorners={false} width="100%" onClick={this.createIdeaClickHandler(idea)}>
                <FormattedMessage {...messages.seeIdea} />
              </StyledButton>
            </Wrapper>
          );
        }}
      </GetIdea>
    );
  }
}
