import React, { PureComponent } from 'react';
import Tippy from '@tippyjs/react';

// components
import IdeaContent from './IdeaContent';
import { Button, Spinner } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';

// typings
import { ManagerType } from 'components/admin/PostManager';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import {
  addTagging,
  deleteTagging,
  switchToManual,
  ITagging,
} from 'services/taggings';
import TagSearch from './TagSearch';
import { isNilOrError } from 'utils/helperUtils';
import { ITag } from 'services/tags';
import { InjectedIntlProps } from 'react-intl';
import TagWrapper from './TagWrapper';
import { trackEventByName } from 'utils/analytics';
import { getTagValidation } from 'utils/tagUtils';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: ${stylingConsts.menuHeight}px;
  align-items: flex-start;
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  width: 60vw;
  padding: 15px 0px 15px 15px;
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
  overflow-y: auto;
  flex: 3;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: sticky;
  top: ${stylingConsts.menuHeight}px;
  align-items: space-between;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  min-width: 20%;
  border-left: 1px solid ${colors.adminSeparation};
`;

const TagSubSection = styled.div`
  margin: 12px 0px;
  &.manualTag {
    flex: 2 7 auto;
    max-height: auto;
    overflow-y: auto;
  }
  &.smartTag {
    flex: 1;
  }
`;

export const TagList = styled.div`
  display: inline-block;
  margin: 0px 10px 10px 0px;
  max-height: auto;
`;

const StyledTagWrapper = styled(TagWrapper)`
  height: 24px;
  font-weight: 500;
  margin: 0px 4px 4px 0px;
  width: fit-content;
  > * {
    font-size: ${fontSizes.large}px;
    align-self: center;
    line-height: 14px;
    > * {
      height: 14px;
    }
  }
`;

const StyledValidationError = styled.p`
  visibility: hidden;
  &.show {
    visibility: visible;
  }
`;

const StyledSpinner = styled(Spinner)`
  display: inline-flex;
  width: auto;
  margin: 4px;
`;

interface DataProps {}

type Direction = 'up' | 'down';
interface InputProps {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  taggings: ITagging[] | null;
  handleNavigation: (direction: Direction) => void;
  tags: ITag[] | null | undefined;
  handlePreventNavigation: (isNavigationPrevented: boolean) => void;
  processing: boolean;
}

interface Props extends InputProps, DataProps {}

interface State {
  postId: string | null;
  newTag: string | null;
  isTagValid: boolean;
}

class PostPreview extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      postId: props.postId,
      newTag: null,
      isTagValid: true,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.postId !== this.props.postId && this.props.postId) {
      setTimeout(() => this.setState({ postId: this.props.postId }), 200);
    }
  }

  onClose = () => {
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
    trackEventByName('Manual Tagging', {
      action: `clicked ${direction} button`,
    });
  };

  getManualTaggings = (taggings: ITagging[]) =>
    taggings.filter(
      (tagging) => tagging.attributes.assignment_method === 'manual'
    );

  getAutomaticTaggings = (taggings: ITagging[]) =>
    taggings.filter(
      (tagging) => tagging.attributes.assignment_method === 'automatic'
    );

  getUnusedTags = (tags: ITag[], taggings: ITagging[]) => {
    const isTagUnused = (taggings: ITagging[], tag: ITag) => {
      const isTagUsed = taggings?.find(
        (tagging) => tagging.attributes.tag_id === tag.id
      );
      return !isTagUsed;
    };
    const unusedTags = tags.filter((tag) => isTagUnused(taggings, tag));
    return unusedTags;
  };

  tagIdea = (tagId) => () => {
    const postId = this.props.postId;
    postId && addTagging(postId, tagId);
    trackEventByName('Manual Tagging', {
      action: 'added existing tag to an idea',
    });
  };

  removeTagging = (taggingId) => () => {
    deleteTagging(taggingId);
    trackEventByName('Manual Tagging', {
      action: 'removed tag from an idea',
    });
  };

  switchToManual = (taggingId) => () => {
    switchToManual(taggingId);
    trackEventByName('Manual Tagging', { action: 'added auto tag to idea' });
  };

  handleSelectExistingFromTagSearch = (tagId: string) => {
    const { postId } = this.state;
    const tagging =
      this.props.taggings &&
      this.getAutomaticTaggings(this.props.taggings).find(
        (tagging) => tagging.attributes.tag_id === tagId
      );

    trackEventByName('Manual Tagging', {
      action: 'selected existing tag from text input',
    });

    if (postId) {
      return tagging ? switchToManual(tagging.id) : addTagging(postId, tagId);
    } else {
      return Promise.reject();
    }
  };

  addTaggingCreateTag = (tagText: string) => {
    const isTagValid = getTagValidation(tagText);
    this.setState({ isTagValid });

    const { locale } = this.props.intl;
    const title_multiloc = {};
    title_multiloc[locale] = tagText;

    trackEventByName('Manual Tagging', {
      action: 'created and assigned tag',
    });

    return this.state.postId && isTagValid
      ? addTagging(this.state.postId, null, { title_multiloc })
      : Promise.reject();
  };

  validateTag = (isTagValid: boolean) => {
    this.setState({ isTagValid });
  };

  render() {
    const { taggings, tags, processing } = this.props;
    const manualTaggings = isNilOrError(taggings)
      ? []
      : this.getManualTaggings(taggings);

    const manualTags = manualTaggings
      .map(
        (tagging) =>
          tags && tags.find((tag) => tag.id === tagging.attributes.tag_id)
      )
      .filter((el) => el) as ITag[];
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
          <Tippy
            placement="top"
            content={
              <ul>
                <li>
                  <FormattedMessage {...messages.upAndDownArrow} />
                </li>
                <li>
                  <FormattedMessage {...messages.returnKey} />
                </li>
                <li>
                  <FormattedMessage {...messages.escapeKey} />
                </li>
              </ul>
            }
            theme="light"
            hideOnClick={true}
          >
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
          </Tippy>
        </Navigation>

        {this.state.postId && (
          <>
            <IdeaContent
              ideaId={this.state.postId}
              manualTaggings={manualTaggings}
            />
            <TagSection>
              <TagSubSection className={'smartTag'}>
                <h4>
                  <FormattedMessage {...messages.approveAutoTags} />
                </h4>
                {(automaticTaggings.length > 0 || processing) && (
                  <TagList>
                    {automaticTaggings.map((tagging) => (
                      <StyledTagWrapper
                        key={tagging.id}
                        onTagClick={this.switchToManual(tagging.id)}
                        icon="plus-circle"
                        isAutoTag={true}
                        isSelected={false}
                        tagId={tagging.attributes.tag_id}
                      />
                    ))}
                    {processing && <StyledSpinner color="#666" size="20px" />}
                  </TagList>
                )}
              </TagSubSection>
              {!isNilOrError(tags) && !isNilOrError(taggings) && (
                <TagSubSection className={'manualTag'}>
                  <h4>
                    <FormattedMessage {...messages.addExistingTag} />
                  </h4>
                  <TagList>
                    {tags.length > 0 &&
                      this.getUnusedTags(tags, taggings).map((tag) => (
                        <StyledTagWrapper
                          key={tag.id}
                          tagId={tag.id}
                          onTagClick={this.tagIdea(tag.id)}
                          icon="plus-circle"
                          isAutoTag={false}
                          isSelected={false}
                        />
                      ))}
                  </TagList>
                </TagSubSection>
              )}
              <TagSubSection className={'tagSearch'}>
                <h4>
                  <FormattedMessage {...messages.addNewTag} />
                </h4>

                <TagSearch
                  filteredOutTags={manualTags}
                  onAddSelect={this.handleSelectExistingFromTagSearch}
                  onAddNew={this.addTaggingCreateTag}
                  onType={this.validateTag}
                  handlePreventNavigation={this.props.handlePreventNavigation}
                />
              </TagSubSection>
              <StyledValidationError
                className={`${!this.state.isTagValid && 'show'}`}
              >
                <FormattedMessage {...messages.tagValidationErrorMessage} />
              </StyledValidationError>
            </TagSection>
          </>
        )}
      </Container>
    );
  }
}

export default injectIntl(PostPreview);
