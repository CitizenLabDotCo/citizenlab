import React, { useState } from 'react';

// hooks
import { useEditor, SerializedNodes } from '@craftjs/core';
import useUpdateHomepageSettings from 'api/home_page/useUpdateHomepageSettings';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n

// routing
import clHistory from 'utils/cl-router/history';

// types
import { Locale } from 'typings';

type ProjectDescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  localesWithError: Locale[];
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
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
  localesWithError,
  hasPendingState,
}: ProjectDescriptionBuilderTopBarProps) => {
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const { mutateAsync: updateHomepage } = useUpdateHomepageSettings();

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
    clHistory.push(`/admin/pages-menu`);
  };

  const handleSave = async () => {
    if (selectedLocale) {
      try {
        setLoading(true);
        await updateHomepage({
          craftjs_json: query.getSerializedNodes(),
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
          <Title>Homepage</Title>
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
          linkTo={`/`}
          openLinkInNewTab
        >
          View homepage
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
