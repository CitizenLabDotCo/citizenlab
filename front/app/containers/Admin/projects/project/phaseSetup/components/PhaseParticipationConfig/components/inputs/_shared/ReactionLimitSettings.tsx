import React, { useId } from 'react';

import Banner from 'design-system/Banner';
import NumberField from 'design-system/NumberField';
import RadioGroup, { Radio } from 'design-system/RadioGroup';

import messages from 'containers/Admin/projects/project/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './ReactionLimitSettings.module.css';
import 'design-system/tokens.css';

type Method = 'unlimited' | 'limited';

const isMethod = (value: string): value is Method =>
  value === 'unlimited' || value === 'limited';

interface Props {
  name: string;
  title: string;
  // Under a participant action row: a row-sized title and the choices side by side.
  nested?: boolean;
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
  nested = false,
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
  const titleId = useId();

  const radios = (
    <>
      <Radio value="unlimited">{formatMessage(messages.unlimited)}</Radio>
      <Radio value="limited">
        {limitedLabel ?? formatMessage(messages.limited)}
      </Radio>
    </>
  );
  const onChange = (value: string) => {
    if (isMethod(value)) onMethodChange(value);
  };

  return (
    <div className={styles.settings} data-nested={nested || undefined}>
      {nested ? (
        <>
          <span id={titleId} className={styles.nestedTitle}>
            {title}
          </span>
          <RadioGroup
            aria-labelledby={titleId}
            orientation="horizontal"
            name={name}
            value={method ?? null}
            onChange={onChange}
          >
            {radios}
          </RadioGroup>
        </>
      ) : (
        <RadioGroup
          label={title}
          name={name}
          value={method ?? null}
          onChange={onChange}
        >
          {radios}
        </RadioGroup>
      )}
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
