import React from 'react';

import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import { SupportedLocale } from 'typings';

import useAddHomepageBuilderLayout from 'api/home_page_layout/useAddHomepageLayout';

import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSelect from 'components/admin/ContentBuilder/TopBar/LocaleSelect';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { View } from 'components/admin/ContentBuilder/ViewContainer/typings';
import ViewPicker from 'components/admin/ContentBuilder/ViewContainer/ViewPicker';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type BuilderTopBarProps = {
  hasPendingState?: boolean;
  hasError?: boolean;
  selectedLocale: SupportedLocale;
  view: View;
  setView: (view: View) => void;
  onSelectLocale: (args: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => void;
};

const BuilderTopBar = ({
  selectedLocale,
  hasError,
  hasPendingState,
  view,
  setView,
  onSelectLocale,
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
    updateHomepage({
      craftjs_json: query.getSerializedNodes(),
    });
  };

  const handleSelectLocale = (locale: SupportedLocale) => {
    const editorData = query.getSerializedNodes();
    onSelectLocale({ locale, editorData });
  };

  return (
    <Container>
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" pl="8px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Title variant="h3" as="h1" mb="0px" mt="0px">
            {formatMessage(messages.homepage)}
          </Title>
        </Box>
        <LocaleSelect locale={selectedLocale} setLocale={handleSelectLocale} />
        <Box mx="32px">
          <ViewPicker view={view} setView={setView} />
        </Box>
        <Button
          id="e2e-view-homepage-button"
          icon="eye"
          buttonStyle="secondary-outlined"
          iconColor={colors.textPrimary}
          iconSize="20px"
          px="11px"
          py="6px"
          ml="32px"
          linkTo="/"
          openLinkInNewTab
        />
        <SaveButton
          isDisabled={!!(disableSave || hasPendingState)}
          isLoading={isLoading}
          onSave={handleSave}
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
