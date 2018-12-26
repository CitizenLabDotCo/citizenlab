import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';

// style
import styled from 'styled-components';
import { quillEditedContent, fontSizes, colors, media } from 'utils/styleUtils';
import T from 'components/T';
import { darken } from 'polished';
import { isUndefined } from 'util';

const Container = styled.div`
  border-radius: 5px;
  padding: 32px;
  background: ${darken(0.006, colors.background)};

  ${media.smallerThanMaxTablet`
    padding: 20px;
    background: ${darken(0.028, colors.background)};
  `}
`;

const InformationBody = styled.div`
  ${quillEditedContent()}
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 23px;

  p {
    font-size: ${fontSizes.base}px;
    line-height: 23px;
  }
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  max-width: 520px;
`;

interface InputProps {
  phaseId: string | null;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  phase: GetPhaseChildProps;
  phaseFiles: GetResourceFilesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseAbout extends PureComponent<Props, State> {
  render() {
    const { locale, phase, phaseFiles, className } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(phase) && !isUndefined(phaseFiles)) {
      const content = phase.attributes.description_multiloc[locale];
      const contentIsEmpty = (!content || isEmpty(content) || content === '<p></p>' || content === '<p><br></p>');

      if (!contentIsEmpty || !isEmpty(phaseFiles)) {
        return (
          <Container className={className}>
            <InformationBody>
              <T value={phase.attributes.description_multiloc} supportHtml={true} />
            </InformationBody>
            {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) &&
              <StyledFileAttachments files={phaseFiles} />
            }
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
  phaseFiles: ({ phaseId, render }) => <GetResourceFiles resourceType="phase" resourceId={phaseId}>{render}</GetResourceFiles>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseAbout {...inputProps} {...dataProps} />}
  </Data>
);
