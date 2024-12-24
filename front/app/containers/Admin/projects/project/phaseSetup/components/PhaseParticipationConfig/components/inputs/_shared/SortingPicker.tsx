import React from 'react';

import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IdeaSortMethod } from 'api/phases/types';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';

interface Props {
  options: { key: string; value: string }[];
  ideas_order: IdeaSortMethod | undefined;
  apiErrors: CLErrors | null | undefined;
  handleIdeaDefaultSortMethodChange: (ideas_order: IdeaSortMethod) => void;
}

export default ({
  ideas_order,
  apiErrors,
  handleIdeaDefaultSortMethodChange,
  options,
}: Props) => {
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
          label={<FormattedMessage {...messages[`${key}SortingMethod`]} />}
        />
      ))}
      <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
    </SectionField>
  );
};
