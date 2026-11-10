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

import messages from '../messages';

type Props = {
  hasPendingState: boolean;
  hasError: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
  onSave: (nodes: SerializedNodes) => Promise<void>;
  isSaving: boolean;
  saveError: SaveError | null;
};

const CustomPageBuilderTopBar = ({
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
}: Props) => {
  const { query } = useEditor();
  const localize = useLocalize();

  const disableSave = hasError || hasPendingState;

  const goBack = () => {
    clHistory.push(backPath);
  };

  const handleSave = async () => {
    await onSave(query.getSerializedNodes());
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
            <FormattedMessage {...messages.customPage} />
          </Title>
          <Text m="0" color="textSecondary">
            {localize(titleMultiloc)}
          </Text>
        </Box>
        <LocaleSelect locale={selectedLocale} setLocale={onSelectLocale} />
        <Box ml="24px" />
        <PreviewToggle
          checked={previewEnabled}
          onChange={handleTogglePreview}
        />
        <ButtonWithLink
          icon="eye"
          buttonStyle="secondary-outlined"
          iconColor={colors.textPrimary}
          iconSize="20px"
          px="11px"
          py="6px"
          ml="32px"
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

export default CustomPageBuilderTopBar;
