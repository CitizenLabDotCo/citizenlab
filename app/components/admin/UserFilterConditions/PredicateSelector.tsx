import React, { memo } from 'react';
import { keys } from 'lodash-es';

import { ruleTypeConstraints, TPredicate, TRuleType } from './rules';
import { IOption } from 'typings';

import { Select } from 'cl2-component-library';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  ruleType: TRuleType;
  selectedPredicate?: TPredicate;
  onChange: (predicate: TPredicate) => void;
};

const PredicateSelector = memo(
  ({
    ruleType,
    selectedPredicate,
    onChange,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const getMessage = (predicate: TPredicate) => {
      const predicateMessages = {
        predicate_begins_with: messages.predicate_begins_with,
        predicate_budgeted_in: messages.predicate_budgeted_in,
        predicate_commented_in: messages.predicate_commented_in,
        predicate_contains: messages.predicate_contains,
        predicate_ends_on: messages.predicate_ends_on,
        predicate_has_value: messages.predicate_has_value,
        predicate_in: messages.predicate_in,
        predicate_is: messages.predicate_is,
        predicate_is_admin: messages.predicate_is_admin,
        predicate_is_after: messages.predicate_is_after,
        predicate_is_before: messages.predicate_is_before,
        predicate_is_checked: messages.predicate_is_checked,
        predicate_is_empty: messages.predicate_is_empty,
        predicate_is_equal: messages.predicate_is_equal,
        predicate_is_exactly: messages.predicate_is_exactly,
        predicate_is_larger_than: messages.predicate_is_larger_than,
        predicate_is_larger_than_or_equal:
          messages.predicate_is_larger_than_or_equal,
        predicate_is_normal_user: messages.predicate_is_normal_user,
        predicate_is_one_of: messages.predicate_is_one_of,
        predicate_is_project_moderator: messages.predicate_is_project_moderator,
        predicate_is_smaller_than: messages.predicate_is_smaller_than,
        predicate_is_smaller_than_or_equal:
          messages.predicate_is_smaller_than_or_equal,
        predicate_is_verified: messages.predicate_is_verified,
        predicate_not_begins_with: messages.predicate_not_begins_with,
        predicate_not_budgeted_in: messages.predicate_not_budgeted_in,
        predicate_not_commented_in: messages.predicate_not_commented_in,
        predicate_not_contains: messages.predicate_not_contains,
        predicate_not_ends_on: messages.predicate_not_ends_on,
        predicate_not_has_value: messages.predicate_not_has_value,
        predicate_not_in: messages.predicate_not_in,
        predicate_not_is: messages.predicate_not_is,
        predicate_not_is_admin: messages.predicate_not_is_admin,
        predicate_not_is_checked: messages.predicate_not_is_checked,
        predicate_not_is_empty: messages.predicate_not_is_empty,
        predicate_not_is_equal: messages.predicate_not_is_equal,
        predicate_not_is_normal_user: messages.predicate_not_is_normal_user,
        predicate_not_is_one_of: messages.predicate_not_is_one_of,
        predicate_not_is_project_moderator:
          messages.predicate_not_is_project_moderator,
        predicate_not_is_verified: messages.predicate_not_is_verified,
        predicate_not_posted_in: messages.predicate_not_posted_input,
        predicate_not_volunteered_in: messages.predicate_not_volunteered_in,
        predicate_not_voted_comment_in: messages.predicate_not_voted_comment_in,
        predicate_not_voted_idea_in: messages.predicate_not_voted_input_in,
        predicate_posted_in: messages.predicate_posted_input,
        predicate_volunteered_in: messages.predicate_volunteered_in,
        predicate_voted_comment_in: messages.predicate_voted_comment_in,
        predicate_voted_idea_in: messages.predicate_voted_input_in,
      };

      return predicateMessages[`predicate_${predicate}`];
    };

    const generateOptions = (): IOption[] => {
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
