import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import PhaseAboutHeader from './PhaseAboutHeader';
import FileAttachments from 'components/UI/FileAttachments';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetResourceFiles, {
  GetResourceFilesChildProps,
} from 'resources/GetResourceFiles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  padding: 30px;
  ${defaultCardStyle}
`;

const InformationBody = styled.div`
  h1,
  h2,
  h3,
  h4 {
    color: ${colors.text} !important;
  }
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

interface State {}

class PhaseAbout extends PureComponent<Props & InjectedLocalized, State> {
  render() {
    const {
      projectId,
      phaseId,
      phase,
      phaseFiles,
      className,
      localize,
    } = this.props;
    const content = localize(phase?.attributes?.description_multiloc);
    const contentIsEmpty =
      content === '' || content === '<p></p>' || content === '<p><br></p>';

    if (!contentIsEmpty || !isEmpty(phaseFiles)) {
      return (
        <Container className={className}>
          <ScreenReaderOnly>
            <FormattedMessage
              tagName="h3"
              {...messages.invisibleTitlePhaseAbout}
            />
          </ScreenReaderOnly>
          <PhaseAboutHeader projectId={projectId} selectedPhaseId={phaseId} />
          <InformationBody>
            <QuillEditedContent textColor="#5E6B75">
              <T
                value={phase?.attributes?.description_multiloc}
                supportHtml={true}
              />
            </QuillEditedContent>
          </InformationBody>

          {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) && (
            <StyledFileAttachments files={phaseFiles} />
          )}
        </Container>
      );
    }

    return null;
  }
}

const PhaseAboutWithHOCs = injectLocalize(PhaseAbout);

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
  phaseFiles: ({ phaseId, render }) => (
    <GetResourceFiles resourceType="phase" resourceId={phaseId}>
      {render}
    </GetResourceFiles>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PhaseAboutWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
