import React, { MouseEvent } from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';
import { RouteType } from 'routes';

import { ITopicData } from 'api/topics/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';
import FilterRadioButton from '../FilterRadioButton';

import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';

interface Props {
  selectableTopics: ITopicData[];
  selectedTopics?: string[] | null;
  onChangeTopicsFilter?: (topics: string[]) => void;
  linkToTagManager: RouteType | null;
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

  const name = 'topics';

  return (
    <Box
      id="e2e-idea-manager-topic-filters"
      display="flex"
      flexDirection="column"
    >
      {/* FilterRadioButton is also used inside FilterSidebarTopicsItem */}
      <FilterRadioButton
        id="all-topics"
        name={name}
        onChange={clearFilter}
        isSelected={!selectedTopics || selectedTopics.length === 0}
        labelContent={<FormattedMessage {...messages.allTopics} />}
      />
      <Divider />
      {typeof linkToTagManager === 'string' && (
        <Box display="inline-flex">
          <ButtonWithLink
            data-cy="e2e-post-manager-topic-filters-edit-tags"
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
          </ButtonWithLink>
        </Box>
      )}
      {selectableTopics.map((topic) => (
        <FilterSidebarTopicsItem
          key={topic.id}
          topic={topic}
          active={isActive(topic.id)}
          onClick={handleItemClick(topic.id)}
          name={name}
        />
      ))}
    </Box>
  );
};

export default FilterSidebarTopics;
