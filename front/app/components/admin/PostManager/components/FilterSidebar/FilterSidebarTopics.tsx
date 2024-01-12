import React, { MouseEvent } from 'react';
import { xor } from 'lodash-es';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { ITopicData } from 'api/topics/types';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

interface Props {
  selectableTopics: ITopicData[];
  selectedTopics?: string[] | null;
  onChangeTopicsFilter?: (topics: string[]) => void;
  linkToTagManager: string;
}

const FilterSidebarTopics = ({
  selectableTopics,
  selectedTopics,
  onChangeTopicsFilter,
  linkToTagManager,
}: Props) => {
  const handleItemClick = (id: string) => (event: MouseEvent) => {
    if (event.ctrlKey) {
      onChangeTopicsFilter &&
        onChangeTopicsFilter(xor(selectedTopics || [], [id]));
    } else {
      onChangeTopicsFilter && onChangeTopicsFilter([id]);
    }
  };

  const clearFilter = () => {
    onChangeTopicsFilter && onChangeTopicsFilter([]);
  };

  const isActive = (id: string) => {
    return selectedTopics ? selectedTopics.indexOf(id) >= 0 : false;
  };

  return (
    <Menu
      id="e2e-idea-manager-topic-filters"
      secondary={true}
      vertical={true}
      fluid={true}
    >
      <Menu.Item
        onClick={clearFilter}
        active={!selectedTopics || selectedTopics.length === 0}
      >
        <FormattedMessage {...messages.allTopics} />
      </Menu.Item>
      <Divider />
      <Box display="inline-flex">
        <Button
          data-cy="e2e-input-manager-topic-filters-edit-tags"
          buttonStyle="text"
          icon="edit"
          pl="12px"
          linkTo={linkToTagManager}
          iconPos="right"
          iconSize="14px"
        >
          <Text m="0px" color="coolGrey600" fontSize="s" textAlign="left">
            <FormattedMessage {...messages.editTags} />
          </Text>
        </Button>
      </Box>
      {selectableTopics.map((topic) => (
        <FilterSidebarTopicsItem
          key={topic.id}
          topic={topic}
          active={isActive(topic.id)}
          onClick={handleItemClick(topic.id)}
        />
      ))}
    </Menu>
  );
};

export default FilterSidebarTopics;
