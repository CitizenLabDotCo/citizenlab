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
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: strech;
  padding: 30px;
  position: relative;
  background: #fff;
  border: solid 1px ${colors.separation};
`;

const IdeaTitle: any = styled.h3`
  color: #333;
  display: block;
  display: -webkit-box;
  width: calc(100% - 50px);
  margin: 0;
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: 28px;
  margin-bottom: 10px;
`;

const IdeaDescription = styled.div`
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
  margin-top: 10px;
  margin-bottom: 30px;
`;

const StyledButton = styled(Button)`
  justify-self: flex-end;
`;

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  display: none;

  ${media.biggerThanLargePhone`
    display: block;
  `}
`;

const CommentIcon = styled(Icon)`
  width: 30px;
  height: 21px;
  fill: ${colors.label};
  margin-right: 7px;
`;

const CloseIcon = styled(Icon)`
  height: 10px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.div`
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 12px;
  right: 12px;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }
`;

interface InputProps {
  ideaId: string;
  onClose?: (event) => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showFooter: 'unauthenticated' | 'votingDisabled' | null;
}

class IdeaBox extends React.PureComponent<Props, State> {
  constructor(props) {
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
    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      return (
        <Container className={this.props['className']}>
          {this.props.onClose &&
            <CloseButton onClick={this.props.onClose}>
              <CloseIcon name="close3" />
            </CloseButton>
          }
          <IdeaTitle>
            <T value={idea.attributes.title_multiloc} />
          </IdeaTitle>
          <IdeaDescription>
            <T as="div" value={idea.attributes.body_multiloc} supportHtml />
          </IdeaDescription>
          <VoteComments>
            {!showFooter &&
              <>
                <VoteControl
                  ideaId={idea.id}
                  size="2"
                  unauthenticatedVoteClick={this.handleUnauthenticatedVoteClick}
                  disabledVoteClick={this.handleDisabledVoteClick}
                />
                <CommentsCount>
                  <CommentIcon name="comments" />
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
        </Container>
      );
    }

    return  <Container className={this.props['className']} />;
  }
}

export default (inputProps: InputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {idea => <IdeaBox {...inputProps} idea={idea} />}
  </GetIdea>
);
