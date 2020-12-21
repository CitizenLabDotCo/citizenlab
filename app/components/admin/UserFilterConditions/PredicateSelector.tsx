import React, { memo } from 'react';
import { keys } from 'lodash-es';

import { TRule, ruleTypeConstraints } from './rules';
import { IOption } from 'typings';

import { Select } from 'cl2-component-library';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  ruleType: TRule['ruleType'];
  predicate: TRule['predicate'];
  onChange: (predicate: TRule['predicate']) => void;
};

const PredicateSelector = memo(
  ({
    ruleType,
    predicate,
    onChange,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const getMessage = (predicateSelector: string) => {
      const predicateMessages = {
        predicate_is: messages.predicate_is,
        predicate_not_is: messages.predicate_not_is,
        predicate_contains: messages.predicate_contains,
        predicate_not_contains: messages.predicate_not_contains,
        predicate_begins_with: messages.predicate_begins_with,
        predicate_not_begins_with: messages.predicate_not_begins_with,
        predicate_ends_on: messages.predicate_ends_on,
        predicate_not_ends_on: messages.predicate_not_ends_on,
        predicate_is_empty: messages.predicate_is_empty,
        predicate_not_is_empty: messages.predicate_not_is_empty,
        predicate_has_value: messages.predicate_has_value,
        predicate_not_has_value: messages.predicate_not_has_value,
        predicate_is_one_of: messages.predicate_is_one_of,
        predicate_not_is_one_of: messages.predicate_not_is_one_of,
        predicate_is_checked: messages.predicate_is_checked,
        predicate_not_is_checked: messages.predicate_not_is_checked,
        predicate_is_before: messages.predicate_is_before,
        predicate_is_exactly: messages.predicate_is_exactly,
        predicate_is_after: messages.predicate_is_after,
        predicate_is_equal: messages.predicate_is_equal,
        predicate_not_is_equal: messages.predicate_not_is_equal,
        predicate_is_larger_than: messages.predicate_is_larger_than,
        predicate_is_larger_than_or_equal:
          messages.predicate_is_larger_than_or_equal,
        predicate_is_smaller_than: messages.predicate_is_smaller_than,
        predicate_is_smaller_than_or_equal:
          messages.predicate_is_smaller_than_or_equal,
        predicate_is_admin: messages.predicate_is_admin,
        predicate_not_is_admin: messages.predicate_not_is_admin,
        predicate_is_project_moderator: messages.predicate_is_project_moderator,
        predicate_not_is_project_moderator:
          messages.predicate_not_is_project_moderator,
        predicate_is_normal_user: messages.predicate_is_normal_user,
        predicate_not_is_normal_user: messages.predicate_not_is_normal_user,
        predicate_in: messages.predicate_in,
        predicate_not_in: messages.predicate_not_in,
        predicate_posted_in: messages.predicate_posted_in,
        predicate_not_posted_in: messages.predicate_not_posted_in,
        predicate_commented_in: messages.predicate_commented_in,
        predicate_not_commented_in: messages.predicate_not_commented_in,
        predicate_voted_idea_in: messages.predicate_voted_idea_in,
        predicate_not_voted_idea_in: messages.predicate_not_voted_idea_in,
        predicate_voted_comment_in: messages.predicate_voted_comment_in,
        predicate_not_voted_comment_in: messages.predicate_not_voted_comment_in,
        predicate_budgeted_in: messages.predicate_budgeted_in,
        predicate_not_budgeted_in: messages.predicate_not_budgeted_in,
        predicate_volunteered_in: messages.predicate_volunteered_in,
        predicate_not_volunteered_in: messages.predicate_not_volunteered_in,
        predicate_is_verified: messages.predicate_is_verified,
        predicate_not_is_verified: messages.predicate_not_is_verified,
      };

      return (
        predicateMessages[`predicate_${ruleType}_${predicateSelector}`] ||
        predicateMessages[`predicate_${predicateSelector}`]
      );
    };

    const generateOptions = (): IOption[] => {
      if (ruleType) {
        return keys(ruleTypeConstraints[ruleType]).map((predicateSelector) => {
          const message = getMessage(predicateSelector);
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
        value={predicate}
        options={generateOptions()}
        onChange={handleOnChange}
      />
    );
  }
);

export default injectIntl(PredicateSelector);
