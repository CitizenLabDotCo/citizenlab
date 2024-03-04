import React from 'react';

// routing
import {
  Box,
  Title,
  Button,
  Text,
  Badge,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

// api
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import messages from '../messages';

interface Props {
  onClickPDFImport: () => void;
}

const TopBar = ({ onClickPDFImport }: Props) => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const topBarTitle =
    localize(project?.data.attributes.title_multiloc) +
    (phase ? ` - ${localize(phase?.data.attributes.title_multiloc)}` : '');

  const isSurvey =
    phase?.data.attributes.participation_method === 'native_survey';

  const backPath = isSurvey
    ? `/admin/projects/${projectId}/phases/${phaseId}/native-survey`
    : `/admin/projects/${projectId}/phases/${phaseId}/ideas`;

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
        <GoBackButton linkTo={backPath} />
        <Box ml="24px">
          <Box display="flex" gap="8px" alignItems="center">
            <Text m="0px" color="textSecondary">
              <FormattedMessage {...messages.inputImporter} />
            </Text>
            <Badge color={colors.textSecondary} className="inverse">
              BETA
            </Badge>
          </Box>

          <Title variant="h4" m="0px" mt="1px">
            {topBarTitle}
          </Title>
        </Box>
      </Box>

      <Box display="flex">
        <Button icon="page" onClick={onClickPDFImport} bgColor={colors.primary}>
          <FormattedMessage {...messages.importFile} />
        </Button>
      </Box>
    </Box>
  );
};

export default TopBar;
