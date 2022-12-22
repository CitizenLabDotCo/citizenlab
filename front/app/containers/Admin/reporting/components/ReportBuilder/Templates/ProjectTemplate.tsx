import React from 'react';

// hooks
// import useProject from

// craft
import { Element } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import TwoColumn from '../Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';

// i18n
import { useIntl } from 'utils/cl-intl';

interface Props {
  reportId: string;
  projectId: string;
}

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Element id="project-report-template" is={Box} canvas>
      <AboutReportWidget reportId={reportId} projectId={projectId} />
      <TwoColumn columnLayout="1-1">
        <Element id="left" is={Container} canvas>
          <GenderWidget
            startAt={undefined}
            endAt={null}
            projectId={projectId}
            title={formatMessage(GenderWidget.craft.custom.title)}
          />
        </Element>
        <Element id="right" is={Container} canvas>
          <AgeWidget
            startAt={undefined}
            endAt={null}
            projectId={projectId}
            title={formatMessage(AgeWidget.craft.custom.title)}
          />
        </Element>
      </TwoColumn>
      <VisitorsWidget
        startAt={undefined}
        endAt={null}
        projectId={projectId}
        title={formatMessage(VisitorsWidget.craft.custom.title)}
      />
    </Element>
  );
};

export default ProjectTemplate;
