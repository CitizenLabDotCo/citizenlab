import React from 'react';

import { Box, Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IdeaSortMethod } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import messages from 'containers/Admin/projects/project/messages';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import OptionPicker from 'components/UI/OptionPicker';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

const SORTING_LABELS: Record<IdeaSortMethod, MessageDescriptor> = {
  trending: messages.trendingSortingMethod,
  comments_count: messages.comments_countSortingMethod,
  random: messages.randomSortingMethod,
  popular: messages.popularSortingMethod,
  new: messages.newestSortingMethod,
  '-new': messages.oldestSortingMethod,
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

  if (variant === 'panel') {
    const title = formatMessage(messages.defaultSorting);

    return (
      <Box mb="10px">
        <SetupCard
          title={title}
          action={
            <OptionPicker
              title={title}
              description={formatMessage(messages.defaultPostSortingTooltip)}
              options={options.map(({ value }) => ({
                value,
                label: formatMessage(SORTING_LABELS[value]),
              }))}
              value={ideas_order}
              onChange={handleIdeaDefaultSortMethodChange}
              size="small"
            />
          }
        >
          {apiErrors?.ideas_order && (
            <Error apiErrors={apiErrors.ideas_order} />
          )}
        </SetupCard>
      </Box>
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
