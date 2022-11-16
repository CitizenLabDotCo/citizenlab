import React from 'react';

// craft
import { useNode } from '@craftjs/core';
import { Box, Input, Title } from '@citizenlab/cl2-component-library';
import VisitorsCard from '../../../../../analytics/admin/components/VisitorsCard';

interface Props {
  title: string | undefined;
  projectFilter: string | undefined;
  startAtMoment: string | undefined;
  endAtMoment: string | undefined;
}

const VisitorsTimelineWidget = ({
  title,
  projectFilter,
  startAtMoment,
  endAtMoment,
}: Props) => {
  console.log(title, projectFilter, startAtMoment, endAtMoment);

  return (
    /* Should we just pass in a generic 'reportConfig' object that all cards can take,
    then we don't have to mess with passing loads of different props around
    some are implicit - if reportConfig present then hide info boxes etc
    or just display="report|dashboard"?
     */

    <Box id="e2e-text-box" minHeight="26px">
      {title}
      <VisitorsCard
        endAtMoment={null}
        startAtMoment={null}
        resolution={'week'}
        projectId={undefined}
        title={title}
      />
    </Box>
  );
};

const VisitorsTimelineSettings = () => {
  const {
    actions: { setProp },
    title,
  } = useNode((node) => ({
    title: node.data.props.title,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <Input
        id="e2e-visitors-timeline-edit"
        label={
          <Title variant="h4" as="h3">
            Title
          </Title>
        }
        placeholder="yo"
        type="text"
        value={title}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
    </Box>
  );
};

VisitorsTimelineWidget.craft = {
  props: {
    title: '',
  },
  related: {
    settings: VisitorsTimelineSettings,
  },
};

export default VisitorsTimelineWidget;
