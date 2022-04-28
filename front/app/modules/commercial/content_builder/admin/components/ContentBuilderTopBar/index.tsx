import React, { useEffect, useState } from 'react';

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
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';

// events
import eventEmitter from 'utils/eventEmitter';

// services
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from '../../../services/contentBuilder';

const ContentBuilderPage = ({ params: { projectId } }: WithRouterProps) => {
  const [loading, setLoading] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const { query } = useEditor();
  const localize = useLocalize();
  const locale = useLocale();
  const project = useProject({ projectId });
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('contentBuilderErrors')
      .subscribe(({ eventValue }) => {
        console.log(eventValue);
        setDisableSave(
          Object.values(eventValue as Record<string, boolean>).some(
            (value: boolean) => value === true
          )
        );
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const goBack = () => {
    clHistory.goBack();
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
        <Button
          disabled={disableSave}
          buttonStyle="primary"
          processing={loading}
          onClick={handleSave}
          data-testid="contentBuilderTopBarSaveButton"
        >
          <FormattedMessage {...messages.contentBuilderSave} />
        </Button>
      </Box>
    </Box>
  );
};

export default withRouter(ContentBuilderPage);
