import React, { PureComponent } from 'react';

// components
import IdeaContent from './IdeaContent';
import { Button, Tag } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';

// typings
import { ManagerType } from 'components/admin/PostManager';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { addTagging, deleteTagging } from 'services/taggings';
import TagSearch from './TagSearch';
import { isNilOrError } from 'utils/helperUtils';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { ITag } from 'services/tags';
import { IMergedTagging } from 'hooks/useTaggings';

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

type Direction = 'up' | 'down';
interface InputProps {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  taggings: IMergedTagging[] | null;
  handleNavigation: (direction: Direction) => void;
  tags: ITag[] | null | undefined;
}

interface Props extends InputProps, DataProps {}

interface State {
  postId: string | null;
  opened: boolean;
  newTag: string | null;
}

class PostPreview extends PureComponent<Props & InjectedLocalized, State> {
  constructor(props: Props & InjectedLocalized) {
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

  handleNavigationClick = (direction: Direction) => (_event) => {
    _event.preventDefault();
    this.props.handleNavigation(direction);
  };

  getManualTaggings = (taggings: IMergedTagging[]) =>
    taggings.filter(
      (tagging) => tagging.attributes.assignment_method === 'manual'
    );
  getAutomaticTaggings = (taggings: IMergedTagging[]) =>
    taggings.filter(
      (tagging) => tagging.attributes.assignment_method === 'automatic'
    );

  tagIdea = (tagId) => () => {
    const postId = this.props.postId;
    postId && addTagging(postId, tagId);
  };

  removeTagging = (taggingId) => () => {
    deleteTagging(taggingId);
  };

  render() {
    const { taggings, localize, tags } = this.props;
    const manualTaggings = isNilOrError(taggings)
      ? []
      : this.getManualTaggings(taggings);
    const automaticTaggings = isNilOrError(taggings)
      ? []
      : this.getAutomaticTaggings(taggings);

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
              onClick={this.handleNavigationClick('up')}
            />
            <StyledNavButton
              iconSize={'8px'}
              locale={'en'}
              icon={'chevron-down'}
              buttonStyle={'admin-dark-outlined'}
              onClick={this.handleNavigationClick('down')}
            />
          </div>
        </Navigation>

        {this.state.postId && (
          <>
            <IdeaContent
              ideaId={this.state.postId}
              manualTaggings={manualTaggings}
            />
            <TagSection>
              {automaticTaggings.length > 0 && (
                <TagSubSection>
                  <FormattedMessage {...messages.addSmartTag} />
                  <TagList>
                    {automaticTaggings.map((tagging) =>
                      tagging.tag ? (
                        <StyledTag
                          key={tagging.id}
                          icon="close"
                          onIconClick={this.removeTagging(tagging.id)}
                          isAutoTag={true}
                          isSelected={false}
                          text={localize(tagging.tag.attributes.title_multiloc)}
                        />
                      ) : null
                    )}
                  </TagList>
                </TagSubSection>
              )}
              {!isNilOrError(tags) && (
                <TagSubSection>
                  <FormattedMessage {...messages.addExistingTag} />
                  <TagList>
                    {tags
                      .filter(
                        (tag) =>
                          !taggings?.find(
                            (tagging) => tagging.attributes.tag_id === tag.id
                          )
                      )
                      .map((tag) => (
                        <StyledTag
                          key={tag.id}
                          onTagClick={this.tagIdea(tag.id)}
                          isAutoTag={false}
                          isSelected={false}
                          text={localize(tag.attributes.title_multiloc)}
                        />
                      ))}
                  </TagList>
                </TagSubSection>
              )}
              <TagSubSection>
                <FormattedMessage {...messages.addNewTag} />
                <TagSearch
                  ideaId={this.state.postId}
                  ideaTagIds={manualTaggings.map((tagging) => tagging.tag?.id)}
                />
              </TagSubSection>
            </TagSection>
          </>
        )}
      </Container>
    );
  }
}

export default injectLocalize(PostPreview);
