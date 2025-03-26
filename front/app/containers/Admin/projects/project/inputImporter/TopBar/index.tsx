import React from 'react';

import {
  Box,
  Title,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ImportButtons from './ImportButtons';
import { getBackPath } from './utils';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const TopBar = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const topBarTitle =
    localize(project?.data.attributes.title_multiloc) + // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (phase ? ` - ${localize(phase?.data.attributes.title_multiloc)}` : '');

  const participationMethod = phase?.data.attributes.participation_method;

  const backPath: RouteType =
    projectId &&
    phaseId &&
    getBackPath(projectId, phaseId, participationMethod);

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
          </Box>

          <Title variant="h4" m="0px" mt="1px">
            {topBarTitle}
          </Title>
        </Box>
      </Box>

      <Box display="flex">
        <ImportButtons
          onClickPDFImport={onClickPDFImport}
          onClickExcelImport={onClickExcelImport}
        />
      </Box>
    </Box>
  );
};

export default TopBar;
