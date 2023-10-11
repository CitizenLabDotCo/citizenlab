import React from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';
import usePhase from 'api/phases/usePhase';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import {
  Box,
  stylingConsts,
  Text,
  Title,
  StatusLabel,
} from '@citizenlab/cl2-component-library';

// utils
import {
  FormBuilderConfig,
  getIsPostingEnabled,
} from 'components/FormBuilder/utils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
  margin-bottom: auto;
`;

type FormBuilderTopBarProps = {
  isSubmitting: boolean;
  builderConfig: FormBuilderConfig;
};

const FormBuilderTopBar = ({
  isSubmitting,
  builderConfig,
}: FormBuilderTopBarProps) => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: project } = useProjectById(projectId);

  const { data: phase } = usePhase(phaseId || null);

  if (!project) {
    return null;
  }

  const isPostingEnabled = getIsPostingEnabled(project.data, phase?.data);
  let viewFormLink = phaseId
    ? `/projects/${project.data.attributes.slug}/ideas/new?phase_id=${phaseId}`
    : `/projects/${project.data.attributes.slug}/ideas/new`;

  if (builderConfig.viewFormLink) {
    viewFormLink = builderConfig.viewFormLink;
  }

  const goBack = () => {
    clHistory.push(builderConfig.goBackUrl || `/admin/projects/${projectId}`);
  };

  return (
    <Box
      position="fixed"
      zIndex="3"
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.white}`}
      borderBottom={`1px solid ${colors.borderLight}`}
      top="0px"
    >
      <Box
        p="16px"
        w="210px"
        h="100%"
        borderRight={`1px solid ${colors.borderLight}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={goBack} />
      </Box>
      <Box display="flex" p="16px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="textSecondary">
            {localize(project.data.attributes.title_multiloc)}
          </Text>
          <Box display="flex" alignContent="center" mt="4px">
            <Title marginRight="8px" marginTop="0" variant="h4" as="h1">
              <FormattedMessage {...builderConfig.formBuilderTitle} />
            </Title>
            {builderConfig.showStatusBadge && (
              <StyledStatusLabel
                text={
                  isPostingEnabled ? (
                    <span style={{ color: colors.success }}>
                      <FormattedMessage {...messages.open} />
                    </span>
                  ) : (
                    <span style={{ color: colors.red400 }}>
                      <FormattedMessage {...messages.closed} />
                    </span>
                  )
                }
                backgroundColor={
                  isPostingEnabled ? colors.successLight : colors.errorLight
                }
              />
            )}
          </Box>
        </Box>
        <Box ml="24px" />
        <Button
          buttonStyle="secondary"
          icon="eye"
          mx="20px"
          disabled={!project}
          linkTo={viewFormLink}
          openLinkInNewTab
          data-cy="e2e-preview-form-button"
        >
          <FormattedMessage {...builderConfig.viewFormLinkCopy} />
        </Button>
        <Button
          buttonStyle="admin-dark"
          processing={isSubmitting}
          type="submit"
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilderTopBar;
