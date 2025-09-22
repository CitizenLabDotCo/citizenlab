import React from 'react';

import {
  Box,
  Spinner,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import { RouteType } from 'routes';
import { Multiloc, SupportedLocale } from 'typings';

import { ProjectDescriptionModelType } from 'api/project_description_builder/types';
import useAddProjectDescriptionBuilderLayout from 'api/project_description_builder/useAddProjectDescriptionBuilderLayout';

import useLocalize from 'hooks/useLocalize';

import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSelect from 'components/admin/ContentBuilder/TopBar/LocaleSelect';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type ProjectDescriptionBuilderTopBarProps = {
  hasPendingState?: boolean;
  hasError?: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: SupportedLocale;
  onSelectLocale: (args: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => void;
  modelId: string;
  modelType: ProjectDescriptionModelType;
  backPath: RouteType;
  previewPath: RouteType;
  titleMultiloc: Multiloc;
};

const ProjectDescriptionBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  hasError,
  hasPendingState,
  modelId,
  modelType,
  backPath,
  previewPath,
  titleMultiloc,
}: ProjectDescriptionBuilderTopBarProps) => {
  const { query } = useEditor();
  const localize = useLocalize();
  const {
    mutate: addProjectDescriptionBuilderLayout,
    isLoading,
    isError,
  } = useAddProjectDescriptionBuilderLayout();

  const disableSave = !!hasError || !!hasPendingState;

  const goBack = () => {
    clHistory.push(backPath);
  };

  const handleSave = async () => {
    addProjectDescriptionBuilderLayout({
      modelId,
      modelType,
      craftjs_json: query.getSerializedNodes(),
    });
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
          {!titleMultiloc ? (
            <Spinner />
          ) : (
            <>
              <Title variant="h3" as="h1" mb="0px" mt="0px">
                <FormattedMessage
                  {...(modelType === 'project'
                    ? messages.descriptionProjectHeading
                    : messages.descriptionFolderHeading)}
                />
              </Title>
              <Text m="0" color="textSecondary">
                {localize(titleMultiloc)}
              </Text>
            </>
          )}
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
          linkTo={previewPath}
        />
        <SaveButton
          isDisabled={disableSave}
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
            <FormattedMessage {...messages.saveError} />
          </Text>
        )}
      </Box>
    </Container>
  );
};

export default ProjectDescriptionBuilderTopBar;
