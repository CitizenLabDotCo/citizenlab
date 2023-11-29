import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';
import RenderNode from './RenderNode';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// default widgets
import Title from '../Widgets/Title';
import Text from '../Widgets/Text';
import TwoColumn from '../Widgets/TwoColumn';
import Image from '../Widgets/Image';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// report builder widgets
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
  MostReactedIdeasWidget,
  // We point to the same widget as MostReactedIdeasWidget because there is data in production and other places that uses the old name. The resolver should be able to handle both names for backwards compatibility.
  MostVotedIdeasWidget: MostReactedIdeasWidget,
  ProjectTemplate,
  PostsByTimeWidget,
  CommentsByTimeWidget,
  ReactionsByTimeWidget,
  // We point to the same widget as ReactionsByTimeWidget because there is data in production and other places that uses the old name. The resolver should be able to handle both names for backwards compatibility.
  VotesByTimeWidget: ReactionsByTimeWidget,
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
