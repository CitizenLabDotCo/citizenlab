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

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { quillEditedContent, fontSizes, colors, media } from 'utils/styleUtils';
import T from 'components/T';
import { darken } from 'polished';

const Container = styled.div`
  border-radius: 5px;
  padding: 34px;
  background: ${darken(0.01, colors.background)};

  ${media.smallerThanMaxTablet`
    padding: 20px;
    background: ${darken(0.04, colors.background)};
  `}
`;

const InformationTitle = styled.h2`
  color: #333;
  font-size: ${fontSizes.large}px;
  font-weight: 600;
`;

const InformationBody = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 23px;

  p {
    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${colors.clBlueDark};
    text-decoration: underline;
    hyphens: auto;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }

  ${quillEditedContent()}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
`;

interface InputProps {
  phaseId: string | null;
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
    const { locale, phase, phaseFiles } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(phase)) {
      const content = phase.attributes.description_multiloc[locale];
      const contentIsEmpty = (!content || isEmpty(content) || content === '<p></p>' || content === '<p><br></p>');

      if (!contentIsEmpty) {
        return (
          <Container className={this.props['className']}>
            <InformationTitle>
              <FormattedMessage {...messages.aboutThisPhase} />
            </InformationTitle>
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
