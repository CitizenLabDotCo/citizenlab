import React from 'react';

// components
import { Radio, IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from '../../../messages';

// typings
import { ApiErrors } from '../..';

interface Props {
  presentation_mode: 'card' | 'map' | null | undefined;
  apiErrors: ApiErrors;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  title?: MessageDescriptor;
}

export default ({
  presentation_mode,
  apiErrors,
  handleIdeasDisplayChange,
  title,
}: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...(title || messages.inputsDefaultView)} />
      <IconTooltip
        content={<FormattedMessage {...messages.inputsDefaultViewTooltip} />}
      />
    </SubSectionTitle>
    {['card', 'map'].map((key) => (
      <Radio
        key={key}
        onChange={handleIdeasDisplayChange}
        currentValue={presentation_mode}
        value={key}
        name="presentation_mode"
        id={`presentation_mode-${key}`}
        label={<FormattedMessage {...messages[`${key}Display`]} />}
      />
    ))}
    <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
  </SectionField>
);
