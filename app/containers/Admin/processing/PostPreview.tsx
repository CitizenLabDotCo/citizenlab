import React, { PureComponent } from 'react';

// components
import IdeaContent from './IdeaContent';
import { Button, Input, Tag } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';

// typings
import { ManagerType } from 'components/admin/PostManager';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: ${stylingConsts.menuHeight}px;
  align-items: flex-start;
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  width: 60vw;
  padding: 15px;
  border-left: 1px solid ${colors.adminSeparation};
  > * {
    padding: 0 15px;
  }
`;

const Navigation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - ${stylingConsts.menuHeight}px - 30px);
  align-items: center;
  width: 36px;
`;

const StyledNavButton = styled(Button)`
  max-width: 8px;
  margin: 2px;
  button {
    padding: 8px 12px !important;
  }
`;
const TagSection = styled.div`
  height: calc(100vh - ${stylingConsts.menuHeight}px - 30px);
  flex: 2;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: sticky;
  top: ${stylingConsts.menuHeight};
  align-self: flex-end;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  min-width: 20%;
  border-left: 1px solid ${colors.adminSeparation};
`;

const TagSubSection = styled.div`
  margin: 12px 0px;
  > * {
    padding: 6px 0px;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const StyledTag = styled(Tag)`
  margin: 0px 4px 4px 0px;
  width: fit-content;
`;

interface DataProps {}

interface InputProps {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
}

interface Props extends InputProps, DataProps {}

interface State {
  postId: string | null;
  opened: boolean;
  newTag: string | null;
}

export default class PostPreview extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      postId: props.postId,
      opened: false,
      newTag: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.postId !== this.props.postId && this.props.postId) {
      this.setState({ opened: true });
      setTimeout(() => this.setState({ postId: this.props.postId }), 200);
    }
  }

  onClose = () => {
    this.setState({ opened: false });
    this.setState({ postId: null });
    this.props.onClose();
  };

  handleTagInput = (newTag: string) => {
    this.setState({
      newTag,
    });
  };

  render() {
    return (
      <Container>
        <Navigation>
          <StyledNavButton
            locale={'en'}
            icon={'close'}
            onClick={this.onClose}
            iconSize={'8px'}
            buttonStyle={'admin-dark-outlined'}
          />
          <div>
            <StyledNavButton
              iconSize={'8px'}
              locale={'en'}
              icon={'chevron-up'}
              buttonStyle={'admin-dark-outlined'}
            />
            <StyledNavButton
              iconSize={'8px'}
              locale={'en'}
              icon={'chevron-down'}
              buttonStyle={'admin-dark-outlined'}
            />
          </div>
        </Navigation>

        {this.state.postId && <IdeaContent ideaId={this.state.postId} />}
        <TagSection>
          <TagSubSection>
            <FormattedMessage {...messages.addSmartTag} />
            <TagList>
              <StyledTag isAutoTag={true} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={true} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={true} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={true} isSelected={false} text="tag one" />
            </TagList>
          </TagSubSection>
          <TagSubSection>
            <FormattedMessage {...messages.addExistingTag} />
            <TagList>
              <StyledTag isAutoTag={false} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={false} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={false} isSelected={false} text="tag one" />
              <StyledTag isAutoTag={false} isSelected={false} text="tag one" />
            </TagList>
          </TagSubSection>
          <TagSubSection>
            <FormattedMessage {...messages.addNewTag} />
            <Input
              type="text"
              value={this.state.newTag}
              autoFocus={true}
              onChange={this.handleTagInput}
            />
          </TagSubSection>
        </TagSection>
      </Container>
    );
  }
}
