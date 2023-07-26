import React, { useState } from 'react';

import { Box, Input, Button } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';

import { useParams } from 'react-router-dom';

import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

const Tags = () => {
  const [name, setName] = useState('');

  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const { data: tags } = useAnalysisTags({
    analysisId,
  });
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();

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
        onSuccess: () => {
          setName('');
        },
      }
    );
  };

  return (
    <div>
      <Box>
        <Box
          display="flex"
          alignItems="center"
          mb="8px"
          as="form"
          className="intercom-insights-edit-add-tag-form"
        >
          <Input
            type="text"
            value={name}
            onChange={onChangeName}
            placeholder={formatMessage(messages.addTag)}
            size="small"
          />
          <Button
            ml="4px"
            p="6px"
            onClick={handleTagSubmit}
            disabled={!name || isLoading}
            icon="plus"
          />
        </Box>
        <div>
          {error && (
            <Error apiErrors={error.errors['name']} fieldName="tag_name" />
          )}
        </div>
      </Box>
      <Box>
        {tags?.data.map((tag) => (
          <Box
            key={tag.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb="8px"
            p="8px"
          >
            <span>{tag.attributes.name}</span>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default Tags;
