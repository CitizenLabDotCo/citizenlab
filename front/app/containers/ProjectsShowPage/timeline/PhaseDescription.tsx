import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';
import PhaseTitle from './PhaseTitle';
import PhaseNavigation from './PhaseNavigation';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import usePhase from 'hooks/usePhase';
import useResourceFiles from 'hooks/useResourceFiles';

// style
import styled, { useTheme } from 'styled-components';
import {
  defaultCardStyle,
  media,
  viewportWidths,
  isRtl,
} from 'utils/styleUtils';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  padding: 30px;
  padding-bottom: 35px;
  ${defaultCardStyle};

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

const Header = styled.div<{ hasContent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => (props.hasContent ? '30px' : '0px')};

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  max-width: 520px;
`;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const PhaseDescription = memo<Props>(({ projectId, phaseId, className }) => {
  const theme: any = useTheme();
  const { windowWidth } = useWindowSize();
  const localize = useLocalize();
  const phase = usePhase(phaseId);
  const phaseFiles = useResourceFiles({
    resourceId: phaseId,
    resourceType: 'phase',
  });

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;
  const content = !isNilOrError(phase)
    ? localize(phase.attributes.description_multiloc)
    : '';
  const contentIsEmpty =
    content === '' || content === '<p></p>' || content === '<p><br></p>';
  const hasContent = !contentIsEmpty || !isEmpty(phaseFiles);

  return (
      aria-live="polite"
      <Header hasContent={hasContent}>
        <PhaseTitle projectId={projectId} selectedPhaseId={phaseId} />
        {!smallerThanSmallTablet && <PhaseNavigation projectId={projectId} />}
      </Header>
      {!isNilOrError(phase) && hasContent && (
        <>
          <QuillEditedContent fontSize="base" textColor={theme.colorText}>
            <T
              value={phase?.attributes?.description_multiloc}
              supportHtml={true}
            />
          </QuillEditedContent>

          {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) && (
            <StyledFileAttachments files={phaseFiles} />
          )}
        </>
      )}
    </Container>
  );
});

export default PhaseDescription;
