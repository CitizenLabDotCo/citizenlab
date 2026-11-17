import React from 'react';

import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IdeaSortMethod } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import messages from 'containers/Admin/projects/project/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import Button from 'design-system/Button';
import { fieldStyles } from 'design-system/Field';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';
import 'design-system/tokens.css';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './SortingPicker.module.css';

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
            <MenuTrigger>
              <Button variant="secondary" size={28} hasMenu>
                {ideas_order
                  ? formatMessage(SORTING_LABELS[ideas_order])
                  : title}
              </Button>
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
            </MenuTrigger>
          }
        >
          {errorMessage && <p className={fieldStyles.error}>{errorMessage}</p>}
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
