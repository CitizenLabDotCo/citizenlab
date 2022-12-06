import React, { PureComponent } from 'react';
// components
import { Icon } from '@citizenlab/cl2-component-library';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
// tracking
import { trackEventByName } from 'utils/analytics';
import Link from 'utils/cl-router/Link';
// dataloading
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
import Author from 'components/Author';
// intl
import T from 'components/T';
// styling
import styled from 'styled-components';
import tracks from './tracks';

const Container = styled.div`
  width: 300px;
  height: 600px;
  overflow: hidden;
  padding: 15px;
  padding-top: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${colors.borderLight};
  position: relative;
  display: flex;
  flex-direction: column;

  h4 {
    font-size: ${fontSizes.m}px;
  }
`;

const TextContainer = styled.div`
  overflow-y: auto;
  margin-top: 22px;
  margin-bottom: 20px;
  flex-grow: 1;
  min-height: 0;
`;
const CloseIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.grey500};
`;
const StyledAuthor = styled(Author)`
  margin-top: 25px;
`;

const CloseButton = styled.button`
  height: 15px;
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 10px;
  right: 10px;
  outline: none;

  &:hover,
  &:focus,
  &:active {
    svg {
      fill: ${colors.teal};
    }
  }
`;

interface DataProps {
  idea: GetIdeaChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
  onClose: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaPane extends PureComponent<Props, State> {
  trackLinkClick = () => {
    const slug =
      !isNilOrError(this.props.idea) && this.props.idea.attributes.slug;
    trackEventByName(tracks.clickIdeaOnMap.name, { extra: { slug } });
  };

  render() {
    const { idea, className, onClose } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <Container className={className}>
        <CloseButton onClick={onClose}>
          <CloseIcon name="close" />
        </CloseButton>

        <Link
          to={`/ideas/${idea.attributes.slug}`}
          target="_blank"
          onClick={this.trackLinkClick}
        >
          <T as="h4" value={idea.attributes.title_multiloc} />
        </Link>

        <StyledAuthor
          authorId={
            idea.relationships.author.data
              ? idea.relationships.author.data.id
              : null
          }
          createdAt={idea.attributes.published_at}
          size={34}
        />
        <TextContainer>
          <T value={idea.attributes.body_multiloc} supportHtml />
        </TextContainer>
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdea ideaId={inputProps.ideaId}>
    {(idea) => <IdeaPane {...inputProps} idea={idea} />}
  </GetIdea>
);
