import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import { Multiloc, SupportedLocale } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { SaveError } from 'components/admin/ContentBuilder/saveError';
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSelect from 'components/admin/ContentBuilder/TopBar/LocaleSelect';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import SaveErrorMessage from 'components/admin/ContentBuilder/TopBar/SaveErrorMessage';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

type DescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  hasError?: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: SupportedLocale;
  onSelectLocale: (args: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => void;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
  onSave: (nodes: SerializedNodes) => void;
  isSaving: boolean;
  saveError: SaveError | null;
};

const DescriptionBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  hasError,
  hasPendingState,
  backPath,
  previewLink,
  titleMultiloc,
  onSave,
  isSaving,
  saveError,
}: DescriptionBuilderTopBarProps) => {
  const { query } = useEditor();
  const localize = useLocalize();

  const disableSave = !!hasError || !!hasPendingState;

  const goBack = () => {
    clHistory.push(backPath);
  };

  const handleSave = () => {
    onSave(query.getSerializedNodes());
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
      <Box display="flex" p="15px" pl="8px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Title variant="h3" as="h1" mb="0px" mt="0px">
            <FormattedMessage {...messages.descriptionFolderHeading} />
          </Title>
          <Text m="0" color="textSecondary">
            {localize(titleMultiloc)}
          </Text>
        </Box>
        <LocaleSelect locale={selectedLocale} setLocale={handleSelectLocale} />
        <Box ml="24px" />
        <PreviewToggle
          checked={previewEnabled}
          onChange={handleTogglePreview}
        />
        <ButtonWithLink
          id="e2e-view-project-button"
          icon="eye"
          buttonStyle="secondary-outlined"
          iconColor={colors.textPrimary}
          iconSize="20px"
          px="11px"
          py="6px"
          ml="32px"
          disabled={!titleMultiloc}
          openLinkInNewTab
          {...previewLink}
        />
        <SaveButton
          isDisabled={disableSave}
          isLoading={isSaving}
          onSave={handleSave}
        />
        <SaveErrorMessage
          saveError={saveError}
          genericMessage={messages.saveError}
          unauthorizedFileMessage={messages.saveErrorUnauthorizedFile}
        />
      </Box>
    </Container>
  );
};

export default DescriptionBuilderTopBar;
