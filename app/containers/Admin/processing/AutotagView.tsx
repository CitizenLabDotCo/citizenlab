import React, { FormEvent, useState, useEffect } from 'react';

// components
import { Button, Icon, Input, Spinner, Tag } from 'cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';

// styling
import styled from 'styled-components';
import { stylingConsts, colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import GoBackButton from 'components/UI/GoBackButton';
import useKeyPress from 'hooks/useKeyPress';
import useTagSuggestions from 'hooks/useTagSuggestions';
import useLocalize from 'hooks/useLocalize';
import { ITag } from 'services/tags';
import useTags from 'hooks/useTags';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: calc(100vh - ${stylingConsts.menuHeight}px - 1px);
`;

const Left = styled.div`
  display: flex;
  align-items: start;
  padding: 2%;
  flex-direction: column;
  width: 60%;
  height: 100%;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  height: 100%;
  background-color: #f9f9fa;
  border-left: 1px solid ${colors.adminBorder};
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StyledSubtitle = styled.p`
  font-size: ${fontSizes.small};
  font-weight: 600;
`;

const StyledSuggestion = styled.p`
  font-size: ${fontSizes.base};
  font-style: italic;
`;

const StyledInput = styled(Input)`
  width: 200px;
`;

const TagList = styled.div`
  margin: auto;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  width: 80%;
`;

const SuggestionList = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  width: 80%;
  align-items: flex-start;
`;
const StyledTag = styled(Tag)`
  margin-bottom: ${fontSizes.xs}px;
  margin-right: ${fontSizes.xs}px;
  height: 24px;
  > * {
    font-size: ${fontSizes.large}px;
    align-self: center;
    line-height: 14px;
    > * {
      height: 14px;
    }
  }
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: #fff;
`;
const TagAssignationButton = styled(Button)`
  align-self: flex-end;
`;

const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
  align-items: stretch;
  justify-content: space-evenly;
  position: relative;
  background-color: white;
  border-bottom: 1px solid ${colors.adminBorder};
`;

const Tab = styled.div`
  margin-top: 12px;
  color: ${colors.adminSecondaryTextColor};
  cursor: pointer;
  &.active,
  :hover {
    color: ${colors.adminTextColor};
    border-bottom: 2px solid ${colors.adminTextColor};
  }
`;

const VerticalSeparator = styled.div`
  height: calc(100% - 4px);

  width: 1px;
  background-color: ${colors.adminSeparation};
`;

interface Props {
  closeView: (e: FormEvent) => void;
  selectedRows: string[];
}

const AutotagView = ({ closeView, selectedRows }: Props) => {
  const locale = useLocale();
  const addTagInputKeyPress = useKeyPress('Enter');
  const [newTag, setNewTag] = useState('');
  const [selectedTagsList, setSelectedTagsList] = useState<ITag[]>([]);
  const [newTagsList, setNewTagsList] = useState<string[]>([]);

  const { tags } = useTags();

  const [isValidTag, setIsValidTag] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'detected' | 'existing'>(
    'detected'
  );

  const localize = useLocalize();

  const { tagSuggestions } = useTagSuggestions(selectedRows);

  useEffect(() => {
    if (addTagInputKeyPress && isValidTag) {
      handleAddNewTag();
    }
  }, [addTagInputKeyPress]);

  const handleAddNewTag = () => {
    setNewTagsList([...newTagsList, newTag]);
    setNewTag('');
  };

  const handleAddExistingTag = (tag: ITag) => () => {
    setSelectedTagsList([...selectedTagsList, tag]);
  };

  const handleNewTagInput = (tag: string) => {
    setNewTag(tag);
  };

  const handleNewTagFromSuggestion = (text: string) => (event) => {
    event.preventDefault();
    setNewTag(text);
  };

  const handleRemoveTagFromSelection = (removedTagID: string) => {
    setSelectedTagsList(
      [...selectedTagsList].splice(
        selectedTagsList.findIndex((tag) => removedTagID === tag.id),
        1
      )
    );
  };

  const handleRemoveNewTag = (removedTag: string) => {
    setNewTagsList(
      [...newTagsList].splice(
        newTagsList.findIndex((tag) => removedTag === tag),
        1
      )
    );
  };

  useEffect(() => {
    if (newTag.length < 2) {
      setIsValidTag(false);
    }

    const splitTag = newTag;
    const wordCount = splitTag.split(' ').filter((n) => {
      return n !== '';
    }).length;

    setIsValidTag(
      !isNilOrError(wordCount) &&
        [1, 2].includes(wordCount) &&
        !newTagsList.includes(newTag)
    );
  }, [newTag]);

  if (!isNilOrError(locale)) {
    return (
      <Container>
        <Left>
          <GoBackButton onClick={closeView} />
          <StyledIcon name={'label'} />
          <h2>
            <FormattedMessage {...messages.tagsToAssign} />
          </h2>
          <StyledSubtitle>
            <FormattedMessage {...messages.tagAssignationExplanation} />
          </StyledSubtitle>
          <h4>
            <FormattedMessage {...messages.addTag} />
          </h4>
          <Row>
            <StyledInput
              type={'text'}
              value={newTag}
              onChange={handleNewTagInput}
              error={
                isValidTag
                  ? ''
                  : 'please use max two words and do not add duplicates'
              }
            ></StyledInput>
            <Button
              locale={locale}
              icon="plus-circle"
              buttonStyle="text"
              onClick={handleAddNewTag}
              disabled={!isValidTag}
            />
          </Row>
          <TagList>
            {selectedTagsList.map((tag) => (
              <StyledTag
                text={localize(tag.attributes.title_multiloc)}
                isAutoTag={false}
                isSelected={false}
                icon={'remove'}
                onTagClick={() => handleRemoveTagFromSelection(tag.id)}
              />
            ))}
            {newTagsList.map((tag) => (
              <StyledTag
                text={tag}
                isAutoTag={false}
                isSelected={false}
                icon={'remove'}
                onTagClick={() => handleRemoveNewTag(tag)}
              />
            ))}
          </TagList>
          <TagAssignationButton
            locale={locale}
            text={<FormattedMessage {...messages.automaticallyAssign} />}
            buttonStyle={'admin-dark'}
          />
        </Left>
        <Right>
          <TabsContainer>
            <Tab
              className={activeTab === 'detected' ? 'active' : ''}
              onClick={() => setActiveTab('detected')}
            >
              Suggestions
            </Tab>
            <Tab
              className={activeTab === 'existing' ? 'active' : ''}
              onClick={() => setActiveTab('existing')}
            >
              Existing tags
            </Tab>
          </TabsContainer>
          {activeTab === 'detected' ? (
            <SuggestionList>
              {tagSuggestions && tagSuggestions?.length > 0 ? (
                tagSuggestions.map((suggestion) => (
                  <Button
                    locale={locale}
                    icon="plus-circle"
                    buttonStyle="text"
                    onClick={handleNewTagFromSuggestion(
                      localize(suggestion.title_multiloc)
                    )}
                    text={localize(suggestion.title_multiloc)}
                  />
                  // <StyledSuggestion
                  //   onClick={handleNewTagInput}
                  //   value={suggestion}
                  // >
                  //   <Icon />
                  //   {suggestion}
                  // </StyledSuggestion>
                ))
              ) : (
                <>
                  <StyledSubtitle>
                    <FormattedMessage {...messages.suggestionLoading} />
                  </StyledSubtitle>
                  <Spinner />
                </>
              )}
            </SuggestionList>
          ) : (
            <TagList>
              {tags
                ?.filter(
                  (tag) =>
                    !selectedTagsList?.find(
                      (selectedTag) => selectedTag.id === tag.id
                    )
                )
                .map((tag) => (
                  <StyledTag
                    key={tag.id}
                    onTagClick={handleAddExistingTag(tag)}
                    isAutoTag={false}
                    isSelected={false}
                    text={localize(tag.attributes.title_multiloc)}
                  />
                ))}
            </TagList>
          )}
        </Right>
      </Container>
    );
  }
  return null;
};

export default AutotagView;
