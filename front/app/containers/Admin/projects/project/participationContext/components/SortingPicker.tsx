import React from 'react';

// components
import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import { IdeaDefaultSortMethod } from 'services/participationContexts';
import { ApiErrors } from '..';

interface Props {
  ideas_order: IdeaDefaultSortMethod | undefined;
  apiErrors: ApiErrors;
  handleIdeaDefaultSortMethodChange: (
    ideas_order: IdeaDefaultSortMethod
  ) => void;
}

export default ({
  ideas_order,
  apiErrors,
  handleIdeaDefaultSortMethodChange,
}: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.defaultSorting} />
      <IconTooltip
        content={<FormattedMessage {...messages.defaultPostSortingTooltip} />}
      />
    </SubSectionTitle>
    {[
      { key: 'trending', value: 'trending' },
      { key: 'random', value: 'random' },
      { key: 'popular', value: 'popular' },
      { key: 'newest', value: 'new' },
      { key: 'oldest', value: '-new' },
    ].map(({ key, value }) => (
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
