import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';
import RenderNode from './RenderNode';

// shared widgets
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// report builder widgets
import TitleMultiloc from '../Widgets/TitleMultiloc';
import TextMultiloc from '../Widgets/TextMultiloc';
import ImageMultiloc from '../Widgets/ImageMultiloc';
import TwoColumn from '../Widgets/TwoColumn';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import VisitorsTrafficSourcesWidget from '../Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import MostReactedIdeasWidget from '../Widgets/MostReactedIdeasWidget';
import PostsByTimeWidget from '../Widgets/ChartWidgets/PostsByTimeWidget';
import CommentsByTimeWidget from '../Widgets/ChartWidgets/CommentsByTimeWidget';
import ReactionsByTimeWidget from '../Widgets/ChartWidgets/ReactionsByTimeWidget';

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
  TitleMultiloc,
  TextMultiloc,
  ImageMultiloc,
  WhiteSpace,
  AboutReportWidget,
  SurveyResultsWidget,
  VisitorsWidget,
  VisitorsTrafficSourcesWidget,
  AgeWidget,
  GenderWidget,
  ActiveUsersWidget,
  MostReactedIdeasWidget,
  ProjectTemplate,
  PostsByTimeWidget,
  CommentsByTimeWidget,
  ReactionsByTimeWidget,
};

// Without this, craftjs sometimes crashes.
// Not sure why. (Luuc)
const PlainDiv = ({ render }) => {
  return <div>{render}</div>;
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
      onRender={isPreview ? PlainDiv : RenderNode}
      enabled={isPreview ? false : true}
      onNodesChange={(data) => {
        onNodesChange && onNodesChange(data.getSerializedNodes());
      }}
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
