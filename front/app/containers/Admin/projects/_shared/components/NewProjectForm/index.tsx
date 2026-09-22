import React, { useState } from 'react';

import { Box, Button, Radio, Text } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import { IUpdatedProjectProperties } from 'api/projects/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import validateTitle from 'containers/Admin/projects/_shared/utils/validateTitle';
import generalMessages from 'containers/Admin/projects/project/general/messages';

import { SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import ProjectContextSection from '../ProjectSetupForm/ProjectContextSection';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';
import { useValidateProjectContext } from '../ProjectSetupForm/ProjectContextSection/utils';
import ProjectNameInput from '../ProjectSetupForm/ProjectNameInput';

import messages from './messages';

interface Props {
  processing: boolean;
  failed: boolean;
  onCancel: () => void;
  onSubmit: (attributes: IUpdatedProjectProperties) => void;
}

const NewProjectForm = ({ processing, failed, onCancel, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const locales = useAppConfigurationLocales();
  const validateProjectContext = useValidateProjectContext();

  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc>({});
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  const [context, setContext] = useState<SpaceAndFolderId>({
    space_id: null,
    folder_id: null,
  });
  const [contextError, setContextError] = useState(false);
  const [listed, setListed] = useState(true);

  if (!locales) return null;

  const handleTitleChange = (titleMultiloc: Multiloc) => {
    setTitleMultiloc(titleMultiloc);
    setTitleError(null);
  };

  const handleContextChange = (spaceAndFolderId: SpaceAndFolderId) => {
    setContext(spaceAndFolderId);
    setContextError(false);
  };

  const handleSubmit = () => {
    const error = validateTitle(
      locales,
      titleMultiloc,
      formatMessage(generalMessages.noTitleErrorMessage)
    );

    if (!isEmpty(error)) {
      setTitleError(error);
      return;
    }

    if (
      !validateProjectContext({
        spaceId: context.space_id,
        folderId: context.folder_id,
        projectInRoot: true,
      })
    ) {
      setContextError(true);
      return;
    }

    onSubmit({ title_multiloc: titleMultiloc, listed, ...context });
  };

  return (
    <Box display="flex" flexDirection="column" gap="24px">
      <ProjectNameInput
        titleMultiloc={titleMultiloc}
        titleError={titleError}
        apiErrors={{}}
        handleTitleMultilocOnChange={handleTitleChange}
      />

      <ProjectContextSection
        spaceId={context.space_id}
        folderId={context.folder_id}
        projectInRoot
        error={contextError}
        onChange={handleContextChange}
      />

      <Box>
        <SubSectionTitle>
          {formatMessage(messages.whoCanFindIt)}
        </SubSectionTitle>
        <Radio
          name="project-discoverability"
          value={true}
          currentValue={listed}
          label={
            <Box>
              <Text color="primary" fontWeight="bold" mt="-1px" mb="0px">
                {formatMessage(messages.public)}
              </Text>
              <Text color="primary" fontSize="s" mt="4px" mb="0px">
                {formatMessage(messages.publicDescription)}
              </Text>
            </Box>
          }
          onChange={() => setListed(true)}
        />
        <Radio
          name="project-discoverability"
          value={false}
          currentValue={listed}
          label={
            <Box>
              <Text color="primary" fontWeight="bold" mt="-1px" mb="0px">
                {formatMessage(messages.private)}
              </Text>
              <Text color="primary" fontSize="s" mt="4px" mb="0px">
                {formatMessage(messages.privateDescription)}
              </Text>
            </Box>
          }
          onChange={() => setListed(false)}
        />
      </Box>

      {failed && <Error text={formatMessage(messages.createError)} />}

      <Box display="flex" justifyContent="flex-end" gap="8px">
        <Button
          buttonStyle="secondary-outlined"
          onClick={onCancel}
          disabled={processing}
        >
          {formatMessage(messages.cancel)}
        </Button>
        <Button
          buttonStyle="admin-dark"
          onClick={handleSubmit}
          processing={processing}
        >
          {formatMessage(messages.createProject)}
        </Button>
      </Box>
    </Box>
  );
};

export default NewProjectForm;
