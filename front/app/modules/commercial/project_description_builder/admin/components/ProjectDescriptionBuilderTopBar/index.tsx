import React, { useState } from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';
import { useEditor, SerializedNodes } from '@craftjs/core';
import useAddProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useAddProjectDescriptionBuilderLayout';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';
import { Box, Spinner, Text, Title } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

// types
import { Locale } from 'typings';

type ProjectDescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  localesWithError: Locale[];
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  draftEditorData?: Record<string, SerializedNodes>;
  onSelectLocale: (args: {
    locale: Locale;
    editorData: SerializedNodes;
  }) => void;
};

const ProjectDescriptionBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  draftEditorData,
  localesWithError,
  hasPendingState,
}: ProjectDescriptionBuilderTopBarProps) => {
  const { projectId } = useParams() as { projectId: string };
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const { mutateAsync: addProjectDescriptionBuilderLayout } =
    useAddProjectDescriptionBuilderLayout();

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/description`);
  };

  const handleSave = async () => {
    if (selectedLocale) {
      try {
        setLoading(true);
        await addProjectDescriptionBuilderLayout({
          projectId,
          craftjs_jsonmultiloc: {
            ...draftEditorData,
            [selectedLocale]: query.getSerializedNodes(),
          },
        });
      } catch {
        // Do nothing
      }
      setLoading(false);
    }
  };

  const handleSelectLocale = (locale: Locale) => {
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
              <Title variant="h4" as="h1">
                <FormattedMessage {...messages.descriptionTopicManagerText} />
              </Title>
            </>
          )}
        </Box>
        <LocaleSwitcher
          selectedLocale={selectedLocale}
          localesWithError={localesWithError}
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
          disabled={!!(disableSave || hasPendingState)}
          processing={loading}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ProjectDescriptionBuilderTopBar;
