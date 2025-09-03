import React, { memo } from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { keys } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { IOption } from 'typings';

import { injectIntl, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import { ruleTypeConstraints, TPredicate, TRuleType } from './rules';

type Props = {
  ruleType: TRuleType;
  selectedPredicate?: TPredicate;
  onChange: (predicate: TPredicate) => void;
};

const PREDICATE_MESSAGES: Record<TPredicate, MessageDescriptor> = {
  begins_with: messages.predicate_begins_with,
  voted_in: messages.predicate_voted_in,
  commented_in: messages.predicate_commented_in,
  contains: messages.predicate_contains,
  ends_on: messages.predicate_ends_on,
  has_value: messages.predicate_has_value,
  in: messages.predicate_in,
  is: messages.predicate_is,
  is_admin: messages.predicate_is_admin,
  is_after: messages.predicate_is_after,
  is_before: messages.predicate_is_before,
  is_checked: messages.predicate_is_checked,
  is_empty: messages.predicate_is_empty,
  is_equal: messages.predicate_is_equal,
  is_exactly: messages.predicate_is_exactly,
  is_larger_than: messages.predicate_is_larger_than,
  is_larger_than_or_equal: messages.predicate_is_larger_than_or_equal,
  is_normal_user: messages.predicate_is_normal_user,
  is_one_of: messages.predicate_is_one_of,
  is_project_moderator: messages.predicate_is_project_moderator,
  is_smaller_than: messages.predicate_is_smaller_than,
  is_smaller_than_or_equal: messages.predicate_is_smaller_than_or_equal,
  is_verified: messages.predicate_is_verified,
  not_begins_with: messages.predicate_not_begins_with,
  not_voted_in: messages.predicate_not_voted_in,
  not_commented_in: messages.predicate_not_commented_in,
  not_contains: messages.predicate_not_contains,
  not_ends_on: messages.predicate_not_ends_on,
  not_has_value: messages.predicate_not_has_value,
  not_in: messages.predicate_not_in,
  not_is: messages.predicate_not_is,
  not_is_admin: messages.predicate_not_is_admin,
  not_is_checked: messages.predicate_not_is_checked,
  not_is_empty: messages.predicate_not_is_empty,
  not_is_equal: messages.predicate_not_is_equal,
  not_is_normal_user: messages.predicate_not_is_normal_user,
  not_is_one_of: messages.predicate_not_is_one_of,
  not_is_project_moderator: messages.predicate_not_is_project_moderator,
  not_is_verified: messages.predicate_not_is_verified,
  not_posted_in: messages.predicate_not_posted_input,
  not_volunteered_in: messages.predicate_not_volunteered_in,
  not_reacted_comment_in: messages.predicate_not_reacted_comment_in,
  not_reacted_idea_in: messages.predicate_not_reacted_input_in,
  posted_in: messages.predicate_posted_input,
  volunteered_in: messages.predicate_volunteered_in,
  registered_to_an_event: messages.predicate_registered_to_an_event,
  not_registered_to_an_event: messages.predicate_not_registered_to_an_event,
  reacted_comment_in: messages.predicate_reacted_comment_in,
  reacted_idea_in: messages.predicate_reacted_input_in,
  something: messages.predicate_something,
  nothing: messages.predicate_nothing,
  is_one_of_projects: messages.predicate_is_one_of_projects,
  is_not_project: messages.predicate_is_not_project,
  is_one_of_folders: messages.predicate_is_one_of_folders,
  is_not_folder: messages.predicate_is_not_folder,
  is_one_of_inputs: messages.predicate_is_one_of_inputs,
  is_not_input: messages.predicate_is_not_input,

  // Event attendance
  attends_something: messages.predicate_attends_something,
  attends_nothing: messages.predicate_attends_nothing,
  attends_some_of: messages.predicate_attends_some_of,
  attends_none_of: messages.predicate_attends_none_of,
  is_one_of_topics: messages.predicate_is_one_of_topics,
  is_not_topic: messages.predicate_is_not_topic,
  is_one_of_areas: messages.predicate_is_one_of_areas,
  is_not_area: messages.predicate_is_not_area,

  // Community monitor
  taken_survey: messages.predicate_taken_survey,
  not_taken_survey: messages.predicate_not_taken_survey,
};

const PredicateSelector = memo(
  ({
    ruleType,
    selectedPredicate,
    onChange,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const getMessage = (predicate: TPredicate) => {
      return PREDICATE_MESSAGES[predicate];
    };

    const generateOptions = (): IOption[] => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (ruleType) {
        const ruleTypePredicates = keys(ruleTypeConstraints[ruleType]);
        return ruleTypePredicates.map((predicate) => {
          const message = getMessage(predicate as TPredicate);
          return {
            value: predicate,
            label: formatMessage(message),
          };
        });
      } else {
        return [];
      }
    };

    const handleOnChange = (option: IOption) => {
      onChange(option.value);
    };

    return (
      <Select
        value={selectedPredicate}
        options={generateOptions()}
        onChange={handleOnChange}
      />
    );
  }
);

export default injectIntl(PredicateSelector);
