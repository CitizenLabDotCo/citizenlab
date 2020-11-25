import React, { FormEvent, useState, useEffect } from 'react';

// components
import { Button, Icon, Input, Tag } from 'cl2-component-library';

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

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: calc(100vh - ${stylingConsts.menuHeight}px - 1px);
`;

const Left = styled.div`
  display: flex;
  align-items: start;
  padding: 5%;
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

const TagList = styled.div`
  margin: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 80%;
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
}

const AutotagView = ({ closeView }: Props) => {
  const locale = useLocale();
  const addTagInputKeyPress = useKeyPress('Enter');
  const [newTag, setNewTag] = useState('');
  const [selectedTagsList, setSelectedTagsList] = useState<string[] | []>([]);
  const [isValidTag, setIsValidTag] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'detected' | 'existing'>(
    'detected'
  );

  useEffect(() => {
    if (addTagInputKeyPress) {
      handleAddNewTag();
    }
  }, [addTagInputKeyPress]);

  const handleAddNewTag = () => {
    setSelectedTagsList([...selectedTagsList, newTag]);
    setNewTag('');
  };

  const handleAddExistingTag = (tag) => {
    setSelectedTagsList([...selectedTagsList, tag]);
  };

  const handleNewTagInput = (tag: string) => {
    setNewTag(tag);
    setIsValidTag(isTagValid(tag));
  };

  const handleRemoveTagFromSelection = (tag: string) => {
    setSelectedTagsList([...selectedTagsList]);
  };

  const isTagValid = (tag) => {
    if (tag.length < 2) {
      return false;
    }

    const wordCount = tag.split(' ').filter((n) => {
      return n != '';
    }).length;

    return !isNilOrError(wordCount) && [1, 2].includes(wordCount);
  };

  if (!isNilOrError(locale)) {
    return (
      <Container>
        <Left>
          <GoBackButton onClick={closeView} />
          <StyledIcon name={'label'} />
          <FormattedMessage {...messages.tags} />
          <FormattedMessage {...messages.tags} />
          <FormattedMessage {...messages.addNewTag} />
          <Row>
            <Input
              type={'text'}
              value={newTag}
              onChange={handleNewTagInput}
              error={isValidTag ? '' : 'please use max two words'}
            ></Input>
            <Button
              locale={locale}
              icon="plus-circle"
              buttonStyle="text"
              onClick={handleAddNewTag}
              disabled={!isValidTag}
            />
          </Row>
          <TagList>
            {selectedTagsList.length > 0 &&
              selectedTagsList?.map((tag: string) => (
                <StyledTag
                  text={tag}
                  isAutoTag={false}
                  isSelected={false}
                  icon={'delete'}
                  onTagClick={() => handleRemoveTagFromSelection('test')}
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
            <div>Suggestions</div>
          ) : (
            <TagList>
              <StyledTag
                text={'tags'}
                isAutoTag={false}
                isSelected={false}
                icon={'plus-circle'}
                onTagClick={handleAddNewTag}
              />
              <StyledTag
                text={'tags'}
                isAutoTag={false}
                isSelected={false}
                onTagClick={() => handleAddExistingTag('test')}
                icon={'plus-circle'}
              />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
              <StyledTag text={'tags'} isAutoTag={false} isSelected={false} />
            </TagList>
          )}
        </Right>
      </Container>
    );
  }
  return null;
};

export default AutotagView;
