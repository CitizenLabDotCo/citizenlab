import React, { useState, useEffect } from 'react';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { useEditor } from '@craftjs/core';
import useLocale from 'hooks/useLocale';

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
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/withRouter';

// services
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from '../../../services/contentBuilder';
import eventEmitter from 'utils/eventEmitter';

type ContentBuilderTopBarProps = {
  mobilePreviewEnabled: boolean;
  setMobilePreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
} & WithRouterProps;

const ContentBuilderTopBar = ({
  params: { projectId },
  mobilePreviewEnabled,
  setMobilePreviewEnabled,
}: ContentBuilderTopBarProps) => {
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const localize = useLocalize();
  const locale = useLocale();
  const project = useProject({ projectId });

  const [contentBuilderErrors, setContentBuilderErrors] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('contentBuilderError')
      .subscribe(({ eventValue }) => {
        setContentBuilderErrors((contentBuilderErrors) => ({
          ...contentBuilderErrors,
          ...(eventValue as Record<string, boolean>),
        }));
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('deleteContentBuilderElement')
      .subscribe(({ eventValue }) => {
        setContentBuilderErrors((contentBuilderErrors) => {
          const deletedElementId = eventValue as string;
          const { [deletedElementId]: _deletedElementId, ...rest } =
            contentBuilderErrors;
          return rest;
        });
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const disableSave = Object.values(contentBuilderErrors).some(
    (value: boolean) => value === true
  );

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/description`);
  };

  const handleSave = async () => {
    if (!isNilOrError(locale)) {
      try {
        setLoading(true);
        await addContentBuilderLayout(
          { projectId, code: PROJECT_DESCRIPTION_CODE },
          { craftjs_jsonmultiloc: { [locale]: JSON.parse(query.serialize()) } }
        );
      } catch {
        // Do nothing
      }
      setLoading(false);
    }
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
