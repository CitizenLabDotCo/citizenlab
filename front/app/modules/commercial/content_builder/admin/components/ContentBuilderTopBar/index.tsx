import React, { useState } from 'react';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { useEditor, SerializedNodes } from '@craftjs/core';

// components
import Container from 'components/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';
import { Box, Spinner, Text, Title } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

// services
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from '../../../services/contentBuilder';

// types
import { Locale } from 'typings';

type ContentBuilderTopBarProps = {
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

const ContentBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  draftEditorData,
  localesWithError,
  hasPendingState,
}: ContentBuilderTopBarProps) => {
  const { projectId } = useParams() as { projectId: string };
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const localize = useLocalize();
  const project = useProject({ projectId });

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/description`);
  };

  const handleSave = async () => {
    if (selectedLocale) {
      try {
        setLoading(true);
        await addContentBuilderLayout(
          { projectId, code: PROJECT_DESCRIPTION_CODE },
          {
            craftjs_jsonmultiloc: {
              ...draftEditorData,
              [selectedLocale]: query.getSerializedNodes(),
            },
          }
        );
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
          {isNilOrError(project) ? (
            <Spinner />
          ) : (
            <>
              <Text mb="0px" color="textSecondary">
                {localize(project.attributes.title_multiloc)}
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
          linkTo={`/projects/${project?.attributes.slug}`}
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

export default ContentBuilderTopBar;
