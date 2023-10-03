import React, { useState } from 'react';

import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import { useParams } from 'react-router-dom';

import Error from 'components/UI/Error';
import { Box, Button, Input } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import translations from './translations';
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

const AddTag = ({ onCreateTag }: { onCreateTag?: (tagId: string) => void }) => {
  const { analysisId } = useParams() as { analysisId: string };

  const [name, setName] = useState('');
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();

  const { formatMessage } = useIntl();

  const onChangeName = (name: string) => {
    setName(name);
  };

  const handleTagSubmit = () => {
    addTag(
      {
        analysisId,
        name,
      },
      {
        onSuccess: (data) => {
          trackEventByName(tracks.manualTagCreated.name, {
            extra: { analysisId, name },
          });
          setName('');
          onCreateTag && onCreateTag(data.data.id);
        },
      }
    );
  };

  return (
    <Box mb="8px">
      <Box display="flex" alignItems="center" as="form">
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          placeholder={formatMessage(translations.addTag)}
          size="small"
          id="e2e-analysis-add-tag-input"
        />
        <Button
          ml="4px"
          p="6px"
          onClick={handleTagSubmit}
          disabled={!name || isLoading}
          icon="plus"
          id="e2e-analysis-add-tag-button"
        />
      </Box>
      <div>
        {error && (
          <Error apiErrors={error.errors['name']} fieldName="tag_name" />
        )}
      </div>
    </Box>
  );
};

export default AddTag;
