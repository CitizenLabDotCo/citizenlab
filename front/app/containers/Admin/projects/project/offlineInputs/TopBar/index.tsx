import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useProjectById from 'api/projects/useProjectById';

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

interface Props {
  phaseId?: string;
  onChangePhase: (phaseId: string) => void;
  onClickPDFImport: () => void;
}

const TopBar = ({ phaseId, onChangePhase, onClickPDFImport }: Props) => {
  const localize = useLocalize();
  const { projectId } = useParams() as {
    projectId: string;
  };

  const { data: project } = useProjectById(projectId);
  const projectTitle = project?.data.attributes.title_multiloc;

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
        <Button icon="page" onClick={onClickPDFImport} bgColor={colors.primary}>
          <FormattedMessage {...messages.importPdf} />
        </Button>
      </Box>
    </Box>
  );
};

export default TopBar;
