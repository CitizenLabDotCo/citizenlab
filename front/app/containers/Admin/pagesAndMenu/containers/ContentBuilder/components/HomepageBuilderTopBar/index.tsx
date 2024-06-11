import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import { SupportedLocale } from 'typings';

import useAddHomepageBuilderLayout from 'api/home_page_layout/useAddHomepageLayout';

import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type BuilderTopBarProps = {
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

const BuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  hasError,
  hasPendingState,
}: BuilderTopBarProps) => {
  const { query } = useEditor();
  const {
    mutate: updateHomepage,
    isError,
    isLoading,
  } = useAddHomepageBuilderLayout();
  const { formatMessage } = useIntl();
  const disableSave = hasError || hasPendingState;

  const goBack = () => {
    clHistory.push(`/admin/pages-menu`);
  };

  const handleSave = () => {
    if (selectedLocale) {
      updateHomepage({
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
          <Title>{formatMessage(messages.homepage)}</Title>
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
          buttonStyle="secondary-outlined"
          icon="eye"
          mx="20px"
          linkTo={`/`}
          openLinkInNewTab
        >
          {formatMessage(messages.viewHomepage)}
        </Button>

        <SaveButton
          disabled={!!(disableSave || hasPendingState)}
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
            {formatMessage(messages.saveError)}
          </Text>
        )}
      </Box>
    </Container>
  );
};

export default BuilderTopBar;
