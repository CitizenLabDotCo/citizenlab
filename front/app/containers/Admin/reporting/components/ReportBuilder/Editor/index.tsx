import React from 'react';
import { SerializedNodes } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import BaseEditor from 'components/admin/ContentBuilder/Editor';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// default widgets
import Title from 'components/admin/ContentBuilder/Widgets/Title';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TwoColumn from '../../../components/ReportBuilder/Widgets/TwoColumn';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// report builder widgets
import AboutReportWidget from '../Widgets/AboutReportWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import VisitorsTrafficSourcesWidget from '../Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';

// templates
import ProjectTemplate from '../Templates/ProjectTemplate';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
  children,
}) => {
  return (
    <BaseEditor
      resolver={{
        Box,
        Container,
        TwoColumn,
        Title,
        Text,
        Image,
        WhiteSpace,
        AboutReportWidget,
        SurveyResultsWidget,
        VisitorsWidget,
        VisitorsTrafficSourcesWidget,
        AgeWidget,
        GenderWidget,
        ProjectTemplate,
      }}
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
