import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

// components
import { Box, Title, Button } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import PhaseSelector from './PhaseSelector';

// i18n
import useLocalize from 'hooks/useLocalize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { stylingConsts, colors } from 'utils/styleUtils';
import { canContainIdeas } from 'api/phases/utils';

interface Props {
  phaseId?: string;
  loadingApproveIdea: boolean;
  loadingDeleteIdea: boolean;
  onChangePhase: (phaseId: string) => void;
  onApproveIdea?: () => void;
  onDeleteIdea?: () => void;
  onClickPDFImport: () => void;
}

const TopBar = ({
  phaseId,
  loadingApproveIdea,
  loadingDeleteIdea,
  onChangePhase,
  onApproveIdea,
  onDeleteIdea,
  onClickPDFImport,
}: Props) => {
  const localize = useLocalize();
  const { projectId } = useParams() as {
    projectId: string;
  };

  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const projectTitle = project?.data.attributes.title_multiloc;
  const blockApproval = phase ? !canContainIdeas(phase.data) : false;

  return (
    <Box
      position="fixed"
      zIndex="10001"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.white}`}
      borderBottom={`1px solid ${colors.grey500}`}
      px="24px"
    >
      <Box display="flex" alignItems="center">
        <GoBackButton linkTo={`/admin/projects/${projectId}/ideas`} />
        <Box ml="24px">
          <Title variant="h4" m="0px" mt="1px">
            {localize(projectTitle)}
          </Title>
        </Box>

        {phaseId && (
          <Box ml="24px">
            <PhaseSelector
              projectId={projectId}
              phaseId={phaseId}
              onChange={onChangePhase}
            />
          </Box>
        )}
      </Box>

      <Box display="flex">
        {onApproveIdea && (
          <Button
            icon="check"
            onClick={onApproveIdea}
            marginRight="20px"
            bgColor={colors.success}
            processing={loadingApproveIdea}
            disabled={blockApproval}
          >
            <FormattedMessage {...messages.approve} />
          </Button>
        )}
        {onDeleteIdea && (
          <Button
            icon="delete"
            onClick={onDeleteIdea}
            marginRight="20px"
            bgColor={colors.error}
            processing={loadingDeleteIdea}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        )}
        <Button icon="page" onClick={onClickPDFImport} bgColor={colors.primary}>
          <FormattedMessage {...messages.importPdf} />
        </Button>
      </Box>
    </Box>
  );
};

export default TopBar;
