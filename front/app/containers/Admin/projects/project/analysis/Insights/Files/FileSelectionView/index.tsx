import React, { useEffect, useRef } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEqual } from 'lodash-es';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { array, object, string } from 'yup';

import useAnalysis from 'api/analyses/useAnalysis';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useFiles from 'api/files/useFiles';

import MultipleSelect from 'components/HookForm/MultipleSelect';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import GoBackButton from 'components/UI/GoBackButton';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
  analysisId: string;
};

const FileSelectionView = ({ setIsFileSelectionOpen, analysisId }: Props) => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const { mutate: updateAnalysis } = useUpdateAnalysis();

  const { data: analysis, isLoading: isLoadingAnalysis } =
    useAnalysis(analysisId);

  const initialFileIds = analysis?.data.relationships.files?.data.map(
    (file) => file.id
  );

  // Track previous file IDs to prevent unnecessary auto-submits
  // (on initial load or reset)
  const previousFileIdsRef = useRef<string[]>(initialFileIds || []);

  const { data: files } = useFiles({
    project: projectId ? [projectId] : [],
  }); // TODO: Add a whitelisting mechanism to only fetch files that can be added to an analysis.

  const { formatMessage } = useIntl();

  // React Hook Form setup
  const schema = object({
    file_ids: array().of(string().required()).default([]),
  });
  type FormData = {
    file_ids: string[];
  };
  const methods = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      file_ids: initialFileIds || [],
    },
    resolver: yupResolver(schema),
  });

  // Watch for changes in file_ids
  const watchedFileIds = useWatch({
    control: methods.control,
    name: 'file_ids',
  });

  // Auto-submit when file_ids changes (debounced by 500ms)
  useEffect(() => {
    // Skip if the values haven't changed from the previous state
    if (isEqual(watchedFileIds, previousFileIdsRef.current)) return;

    const timeoutId = setTimeout(() => {
      methods.handleSubmit(() => {
        updateAnalysis({
          id: analysisId,
          files: watchedFileIds,
        });

        previousFileIdsRef.current = watchedFileIds;
      })();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedFileIds, methods, updateAnalysis, analysisId]);

  // Generate options for the file select dropdown
  const fileOptions =
    files?.data
      .map((file) => ({ value: file.id, label: file.attributes.name }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  return (
    <FormProvider {...methods}>
      <form>
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          maxWidth="500px"
        >
          <Box mt="12px" display="flex" justifyContent="flex-start">
            <GoBackButton
              showGoBackText={false}
              onClick={() => setIsFileSelectionOpen(false)}
            />
            <Title
              fontWeight="semi-bold"
              m="0px"
              variant="h4"
              mt="2px"
              ml="16px"
            >
              {formatMessage(messages.attachFilesWithCurrentCount, {
                numberAttachedFiles: watchedFileIds.length || 0,
              })}
            </Title>
            <NewLabel ml="4px" mt="4px" expiryDate={new Date('2026-01-15')} />
          </Box>

          <Text>{formatMessage(messages.attachFilesDescription)}</Text>

          <MultipleSelect
            name="file_ids"
            options={fileOptions}
            disabled={isLoadingAnalysis}
            placeholder={formatMessage(messages.attachFilesFromProject)}
          />

          <Box mt="24px">
            <ButtonWithLink
              linkTo={`/admin/projects/${projectId}/files`}
              buttonStyle="text"
              icon="open-in-new"
              iconPos="right"
              openLinkInNewTab={true}
            >
              {formatMessage(messages.manageFiles)}
            </ButtonWithLink>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default FileSelectionView;
