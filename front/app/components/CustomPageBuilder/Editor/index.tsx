import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import { VerticalRhythmContext } from 'components/admin/ContentBuilder/verticalRhythm';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import Areas from 'components/admin/ContentBuilder/Widgets/Areas';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import CallToAction from 'components/admin/ContentBuilder/Widgets/CallToAction';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import CustomPages from 'components/admin/ContentBuilder/Widgets/CustomPages';
import EventsList from 'components/admin/ContentBuilder/Widgets/Events';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import FinishedOrArchived from 'components/admin/ContentBuilder/Widgets/FinishedOrArchived';
import FollowedItems from 'components/admin/ContentBuilder/Widgets/FollowedItems';
import HtmlBlockMultiloc from 'components/admin/ContentBuilder/Widgets/HtmlBlockMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import OpenToParticipation from 'components/admin/ContentBuilder/Widgets/OpenToParticipation';
import PageLink from 'components/admin/ContentBuilder/Widgets/PageLink';
import Published from 'components/admin/ContentBuilder/Widgets/Published';
import Selection from 'components/admin/ContentBuilder/Widgets/Selection';
import Spotlight from 'components/admin/ContentBuilder/Widgets/Spotlight';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import VideoEmbed from 'components/admin/ContentBuilder/Widgets/VideoEmbed';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import {
  CustomPageRoot,
  CustomPageBody,
} from 'components/CustomPageBuilder/regions';
import CustomPageBanner from 'components/CustomPageBuilder/Widgets/CustomPageBanner';
import CustomPageTitle from 'components/CustomPageBuilder/Widgets/CustomPageTitle';
import ProjectsByFilter from 'components/CustomPageBuilder/Widgets/ProjectsByFilter';
import BaseEditor from 'components/DescriptionBuilder/Editor/Editor';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import RichTextMultiloc from 'components/DescriptionBuilder/Widgets/RichTextMultiloc';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

const Editor = ({ onNodesChange, isPreview, children }: EditorProps) => {
  return (
    <VerticalRhythmContext.Provider value={true}>
      <BaseEditor
        resolver={{
          Box,
          EventsList,
          Container,
          TwoColumn,
          ThreeColumn,
          TextMultiloc,
          ImageMultiloc,
          IframeMultiloc,
          FileAttachment,
          ProjectsByFilter,
          AccordionMultiloc,
          WhiteSpace,
          InfoWithAccordions,
          // Bridge widget: resolvable so derived layouts render, absent from the toolbox.
          RichTextMultiloc,
          HtmlBlockMultiloc,
          ImageTextCards,
          ButtonMultiloc,
          PageLink,
          Spotlight,
          Selection,
          CustomPages,
          Published,
          OpenToParticipation,
          FinishedOrArchived,
          FollowedItems,
          Areas,
          CallToAction,
          VideoEmbed,
          CustomPageRoot,
          CustomPageBanner,
          CustomPageTitle,
          CustomPageBody,
        }}
        // DropPlacementOverlay draws the drop indicator instead, so a refused drop
        // carries its reason.
        indicator={{ style: { display: 'none' } }}
        isPreview={isPreview}
        onNodesChange={onNodesChange}
      >
        {children}
      </BaseEditor>
    </VerticalRhythmContext.Provider>
  );
};

export default Editor;
