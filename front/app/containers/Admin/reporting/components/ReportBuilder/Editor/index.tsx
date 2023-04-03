import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';
import RenderNode from './RenderNode';
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
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import MostVotedIdeasWidget from '../Widgets/MostVotedIdeasWidget';
import PostsByTimeWidget from '../Widgets/ChartWidgets/PostsByTimeWidget';
import CommentsByTimeWidget from '../Widgets/ChartWidgets/CommentsByTimeWidget';
import VotesByTimeWidget from '../Widgets/ChartWidgets/VotesByTimeWidget';

// templates
import ProjectTemplate from '../Templates/ProjectTemplate';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

const resolver = {
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
  ActiveUsersWidget,
  MostVotedIdeasWidget,
  ProjectTemplate,
  PostsByTimeWidget,
  CommentsByTimeWidget,
  VotesByTimeWidget,
};

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
  children,
}) => {
  return (
    <CraftEditor
      resolver={resolver}
      indicator={{
        success: 'rgb(98, 196, 98)',
        error: 'red',
        transition: 'none',
      }}
      onRender={isPreview ? undefined : RenderNode}
      enabled={isPreview ? false : true}
      onNodesChange={(data) =>
        onNodesChange && onNodesChange(data.getSerializedNodes())
      }
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
