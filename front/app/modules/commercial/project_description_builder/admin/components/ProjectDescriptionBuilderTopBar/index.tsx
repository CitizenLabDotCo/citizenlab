import React from 'react';

import { Box, Spinner, Text, Title } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import useAddProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useAddProjectDescriptionBuilderLayout';
import { useParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type ProjectDescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  hasError?: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: SupportedLocale | undefined;
  onSelectLocale: (args: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => void;
};

const ProjectDescriptionBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  hasError,
  hasPendingState,
}: ProjectDescriptionBuilderTopBarProps) => {
  const { projectId } = useParams() as { projectId: string };

  const { query } = useEditor();
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const {
    mutate: addProjectDescriptionBuilderLayout,
    isLoading,
    isError,
  } = useAddProjectDescriptionBuilderLayout();

  const disableSave = !!hasError || !!hasPendingState;

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/settings/description`);
  };

  const handleSave = async () => {
    if (selectedLocale) {
      addProjectDescriptionBuilderLayout({
        projectId,
        craftjs_json: query.getSerializedNodes(),
      });
    }
  };

  const handleSelectLocale = (locale: SupportedLocale) => {
    const editorData = query.getSerializedNodes();
    onSelectLocale({ locale, editorData });
  };

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          {!project ? (
            <Spinner />
          ) : (
            <>
              <Text mb="0px" color="textSecondary">
                {localize(project.data.attributes.title_multiloc)}
              </Text>
              <Title styleVariant="h4" as="h1">
                <FormattedMessage {...messages.descriptionTopicManagerText} />
              </Title>
            </>
          )}
        </Box>
        <LocaleSwitcher
          selectedLocale={selectedLocale}
          onSelectLocale={handleSelectLocale}
        />
        <Box ml="24px" />
        <PreviewToggle
          checked={previewEnabled}
          onChange={handleTogglePreview}
        />
        <Button
          id="e2e-view-project-button"
          buttonStyle="secondary"
          icon="eye"
          mx="20px"
          disabled={!project}
          linkTo={`/projects/${project?.data.attributes.slug}`}
          openLinkInNewTab
        >
          <FormattedMessage {...messages.viewProject} />
        </Button>
        <SaveButton
          disabled={disableSave}
          processing={isLoading}
          onClick={handleSave}
        />
        {isError && (
          <Text
            color="error"
            ml="20px"
            position="absolute"
            right="16px"
            bottom="-18px"
            fontSize="s"
          >
            <FormattedMessage {...messages.saveError} />
          </Text>
        )}
      </Box>
    </Container>
  );
};

export default ProjectDescriptionBuilderTopBar;
