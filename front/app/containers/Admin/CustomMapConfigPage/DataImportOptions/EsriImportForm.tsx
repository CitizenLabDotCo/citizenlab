import React from 'react';

import Banner from 'design-system/Banner';
import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';
import TextField from 'design-system/TextField';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './DataImportOptions.module.css';

interface Props {
  title: string;
  tooltip: string;
  instruction: string;
  inputId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  importDataCy: string;
  isPending: boolean;
  onCancel: () => void;
  onImport: () => void;
  success: boolean;
  errorId: string;
  // Set when the import failed.
  errorMessage?: string;
}

// The redesign's form for an Esri feature layer or web map import.
const EsriImportForm = ({
  title,
  tooltip,
  instruction,
  inputId,
  value,
  onChange,
  placeholder,
  importDataCy,
  isPending,
  onCancel,
  onImport,
  success,
  errorId,
  errorMessage,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.esriForm}>
      <h3 className={styles.esriHeading}>
        <span className={styles.esriTitle}>{title}</span>
        <IconButton icon="info-16" size={24} aria-label={tooltip} />
      </h3>
      <TextField
        id={inputId}
        label={instruction}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className={styles.esriActions}>
        <Button onPress={onCancel}>{formatMessage(messages.cancel2)}</Button>
        <Button
          variant="primary"
          data-cy={importDataCy}
          isDisabled={!value}
          isPending={isPending}
          onPress={onImport}
        >
          {formatMessage(messages.import2)}
        </Button>
      </div>
      {success && <Banner>{formatMessage(messages.layerAdded)}</Banner>}
      {errorMessage !== undefined && (
        <div id={errorId}>
          <Banner tone="error">{errorMessage}</Banner>
        </div>
      )}
    </div>
  );
};

export default EsriImportForm;
