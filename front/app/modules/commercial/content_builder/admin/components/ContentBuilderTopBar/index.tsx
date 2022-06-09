import React, { useState } from 'react';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { useEditor, SerializedNodes } from '@craftjs/core';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';
import {
  Box,
  stylingConsts,
  Spinner,
  Text,
  Title,
  Toggle,
  LocaleSwitcher,
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';

// services
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from '../../../services/contentBuilder';

// types
import { Locale } from 'typings';

type ContentBuilderTopBarProps = {
  localesWithError: Locale[];
  mobilePreviewEnabled: boolean;
  setMobilePreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  draftEditorData?: Record<string, SerializedNodes>;
  onSelectLocale: (args: {
    locale: Locale;
    editorData: SerializedNodes;
  }) => void;
} & WithRouterProps;

const ContentBuilderTopBar = ({
  params: { projectId },
  mobilePreviewEnabled,
  setMobilePreviewEnabled,
  selectedLocale,
  onSelectLocale,
  draftEditorData,
  localesWithError,
}: ContentBuilderTopBarProps) => {
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const localize = useLocalize();
  const project = useProject({ projectId });
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales)) {
    return null;
  }

  const disableSave = localesWithError.length > 0;

  const localesValues = locales.reduce((acc, locale) => {
    if (localesWithError.includes(locale)) {
      return {
        ...acc,
        [locale]: '',
      };
    }
    return {
      ...acc,
      [locale]: 'NON-EMPTY-VALUE',
    };
  }, {});

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

  return (
    <Box
      position="fixed"
      zIndex="3"
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.adminContentBackground}`}
      borderBottom={`1px solid ${colors.mediumGrey}`}
    >
      <Box
        p="15px"
        w="210px"
        h="100%"
        borderRight={`1px solid ${colors.mediumGrey}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={goBack} />
      </Box>
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          {isNilOrError(project) ? (
            <Spinner />
          ) : (
            <>
              <Text mb="0px" color="adminSecondaryTextColor">
                {localize(project.attributes.title_multiloc)}
              </Text>
              <Title variant="h4" as="h1">
                <FormattedMessage {...messages.descriptionTopicManagerText} />
              </Title>
            </>
          )}
        </Box>
        {!isNilOrError(locales) && selectedLocale && locales.length > 0 && (
          <Box
            borderLeft={`1px solid ${colors.separation}`}
            borderRight={`1px solid ${colors.separation}`}
            h="100%"
            p="24px"
          >
            <LocaleSwitcher
              locales={locales}
              selectedLocale={selectedLocale}
              onSelectedLocaleChange={handleSelectLocale}
              values={{ localesValues }}
            />
          </Box>
        )}
        <Box ml="24px" />
        <Toggle
          id="e2e-mobile-preview-toggle"
          label={<FormattedMessage {...messages.mobilePreview} />}
          checked={mobilePreviewEnabled}
          onChange={() => setMobilePreviewEnabled(!mobilePreviewEnabled)}
        />
        <Button
          disabled={disableSave}
          id="e2e-content-builder-topbar-save"
          buttonStyle="primary"
          processing={loading}
          onClick={handleSave}
          data-testid="contentBuilderTopBarSaveButton"
          ml="24px"
        >
          <FormattedMessage {...messages.contentBuilderSave} />
        </Button>
      </Box>
    </Box>
  );
};

export default withRouter(ContentBuilderTopBar);
