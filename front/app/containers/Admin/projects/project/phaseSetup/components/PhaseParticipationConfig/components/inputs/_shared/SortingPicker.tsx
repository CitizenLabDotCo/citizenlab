import React, { useId } from 'react';

import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { FieldError } from 'design-system/Field';
import Menu, { MenuItem } from 'design-system/Menu';

import { IdeaSortMethod } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import messages from 'containers/Admin/projects/project/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './SortingPicker.module.css';
import 'design-system/tokens.css';

const SORTING_LABELS: Record<IdeaSortMethod, MessageDescriptor> = {
  trending: messages.trendingSortingMethod,
  comments_count: messages.comments_countSortingMethod,
  random: messages.randomSortingMethod,
  popular: messages.popularSortingMethod,
  new: messages.newestSortingMethod,
  '-new': messages.oldestSortingMethod,
  status_priority: messages.status_prioritySortingMethod,
};

interface Props {
  options: { key: string; value: IdeaSortMethod }[];
  ideas_order: IdeaSortMethod | undefined;
  apiErrors: CLErrors | null | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
  variant?: 'default' | 'panel';
}

export default ({
  ideas_order,
  apiErrors,
  handleIdeaDefaultSortMethodChange,
  options,
  variant = 'default',
}: Props) => {
  const { formatMessage } = useIntl();
  const errorId = useId();
  const getApiErrorMessage = useApiErrorText();

  if (variant === 'panel') {
    const title = formatMessage(messages.defaultSorting);
    const errorMessage = getApiErrorMessage(apiErrors?.ideas_order);

    return (
      <div className={styles.card}>
        <SetupCard
          reviewKey="sorting"
          title={title}
          titleTooltip={
            <FormattedMessage {...messages.defaultPostSortingTooltip} />
          }
          action={
            ideas_order && (
              <SummaryPill label={formatMessage(SORTING_LABELS[ideas_order])} />
            )
          }
          menuDescribedBy={errorMessage ? errorId : undefined}
          menu={
            <Menu
              aria-label={title}
              selectionMode="single"
              selectedKeys={new Set(ideas_order ? [ideas_order] : [])}
              onAction={(key) => {
                const option = options.find(({ value }) => value === key);
                if (option) handleIdeaDefaultSortMethodChange(option.value);
              }}
            >
              {options.map(({ key, value }) => (
                <MenuItem key={key} id={value}>
                  {formatMessage(SORTING_LABELS[value])}
                </MenuItem>
              ))}
            </Menu>
          }
        >
          {errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
        </SetupCard>
      </div>
    );
  }

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.defaultSorting} />
        <IconTooltip
          content={<FormattedMessage {...messages.defaultPostSortingTooltip} />}
        />
      </SubSectionTitle>
      {options.map(({ key, value }) => (
        <Radio
          key={key}
          onChange={handleIdeaDefaultSortMethodChange}
          currentValue={ideas_order}
          value={value}
          name="IdeaDefaultSortMethod"
          id={`ideas_order-${key}`}
          label={<FormattedMessage {...SORTING_LABELS[value]} />}
        />
      ))}
      <Error apiErrors={apiErrors && apiErrors.ideas_order} />
    </SectionField>
  );
};
