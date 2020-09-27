import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';
import AboutHeader from './AboutHeader';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetResourceFiles, {
  GetResourceFilesChildProps,
} from 'resources/GetResourceFiles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled, { useTheme } from 'styled-components';
import { defaultCardStyle, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  padding: 30px;
  padding-bottom: 35px;
  margin-bottom: 70px;
  ${defaultCardStyle};

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  max-width: 520px;
`;

interface InputProps {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
  phaseFiles: GetResourceFilesChildProps;
}

interface Props extends InputProps, DataProps {}

const About = memo<Props & InjectedLocalized>(
  ({ projectId, phaseId, phase, phaseFiles, className, localize }) => {
    const theme: any = useTheme();

    const content = localize(phase?.attributes?.description_multiloc);
    const contentIsEmpty =
      content === '' || content === '<p></p>' || content === '<p><br></p>';

    if (!contentIsEmpty || !isEmpty(phaseFiles)) {
      return (
        <Container className={className}>
          <AboutHeader projectId={projectId} selectedPhaseId={phaseId} />
          <ScreenReaderOnly>
            <FormattedMessage
              tagName="h3"
              {...messages.invisibleTitlePhaseAbout}
            />
          </ScreenReaderOnly>
          <QuillEditedContent fontSize="base" textColor={theme.colorText}>
            <T
              value={phase?.attributes?.description_multiloc}
              supportHtml={true}
            />
          </QuillEditedContent>

          {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) && (
            <StyledFileAttachments files={phaseFiles} />
          )}
        </Container>
      );
    }

    return null;
  }
);

const AboutWithHoC = injectLocalize(About);

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
  phaseFiles: ({ phaseId, render }) => (
    <GetResourceFiles resourceType="phase" resourceId={phaseId}>
      {render}
    </GetResourceFiles>
  ),
});

const AboutWithHoCAndData = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AboutWithHoC {...inputProps} {...dataProps} />}
  </Data>
);

export default AboutWithHoCAndData;
