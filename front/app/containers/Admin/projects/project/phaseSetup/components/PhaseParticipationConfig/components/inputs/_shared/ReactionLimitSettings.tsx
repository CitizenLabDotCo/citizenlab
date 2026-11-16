import React from 'react';

import Banner from 'design-system/Banner';
import NumberField from 'design-system/NumberField';
import RadioGroup, { Radio } from 'design-system/RadioGroup';
import 'design-system/tokens.css';

import messages from 'containers/Admin/projects/project/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './ReactionLimitSettings.module.css';

type Method = 'unlimited' | 'limited';

const isMethod = (value: string): value is Method =>
  value === 'unlimited' || value === 'limited';

interface Props {
  name: string;
  title: string;
  method: Method | null | undefined;
  max: number | null | undefined;
  maxLabel: string;
  limitedLabel?: string;
  methodError?: string;
  maxError?: string;
  onMethodChange: (method: Method) => void;
  onMaxChange: (max: string) => void;
}

const ReactionLimitSettings = ({
  name,
  title,
  method,
  max,
  maxLabel,
  limitedLabel,
  methodError,
  maxError,
  onMethodChange,
  onMaxChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.settings}>
      <RadioGroup
        label={title}
        name={name}
        value={method ?? null}
        onChange={(value) => {
          if (isMethod(value)) onMethodChange(value);
        }}
      >
        <Radio value="unlimited">{formatMessage(messages.unlimited)}</Radio>
        <Radio value="limited">
          {limitedLabel ?? formatMessage(messages.limited)}
        </Radio>
      </RadioGroup>
      {method === 'limited' && (
        <NumberField
          id={`${name}-max`}
          label={maxLabel}
          size={32}
          // NaN is how React Aria shows an empty field and keeps it controlled.
          value={max || NaN}
          minValue={1}
          onChange={(number) =>
            onMaxChange(Number.isNaN(number) ? '' : `${number}`)
          }
          isInvalid={!!maxError}
          errorMessage={maxError}
        />
      )}
      {methodError && <Banner tone="error">{methodError}</Banner>}
    </div>
  );
};

export default ReactionLimitSettings;
