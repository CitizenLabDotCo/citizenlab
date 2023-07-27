import React, { useEffect, useState } from 'react';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Box, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

// mostly copied from front/app/containers/Admin/initiatives/settings/ReactingThreshold.tsx
const CosponsorsNumber = ({ value, onChange, disabled }: Props) => {
  const initiativeCosponsorsAllowed = useFeatureFlag({
    name: 'initiative_cosponsors',
  });
  const { formatMessage } = useIntl();
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (isNaN(value) && !changed) {
      onChange(3); // default value
    }
  }, [onChange, value, changed]);

  if (!initiativeCosponsorsAllowed) return null;

  const handleReactingTresholdOnChange = (value: string) => {
    onChange(parseInt(value, 10));
    setChanged(true);
  };

  return (
    <SectionField>
      <SubSectionTitle>
        {formatMessage(messages.cosponsorsNumberLabel)}
      </SubSectionTitle>
      <Box mb="10px">
        <Input
          name="cosponsors_number"
          type="number"
          min="1"
          required={true}
          value={value?.toString()}
          onChange={handleReactingTresholdOnChange}
          disabled={disabled}
        />
      </Box>

      {isNaN(value) && <Error text={formatMessage(errorMessages.blank)} />}

      {!isNaN(value) && value < 1 && (
        <Error text={formatMessage(messages.cosponsorsNumberMinError)} />
      )}
    </SectionField>
  );
};

export default CosponsorsNumber;
