import { createContext, useContext } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { useEditor, useNode } from '@craftjs/core';

// Spacing between stacked widgets is a property of the boundary between two
// roles, not of a widget: https://govocal-prototypes.pages.dev/playground/fo-spacing-rhythm/
export const VerticalRhythmContext = createContext(false);

type WidgetRole = 'flow' | 'card' | 'band';

const WIDGET_ROLES: Record<string, WidgetRole> = {
  TextMultiloc: 'flow',
  RichTextMultiloc: 'flow',
  ImageMultiloc: 'flow',
  IframeMultiloc: 'flow',
  ButtonMultiloc: 'flow',
  WhiteSpace: 'flow',
  HtmlBlockMultiloc: 'flow',
  FileAttachment: 'flow',
  PageLink: 'flow',
  TwoColumn: 'flow',
  ThreeColumn: 'flow',
  AccordionMultiloc: 'card',
  AboutBox: 'card',
  ImageTextCards: 'card',
  InfoWithAccordions: 'card',
  ExtraSurveysWidget: 'card',
  PhasesWidget: 'band',
  EventsWidget: 'band',
};

const BOUNDARY_MARGINS = {
  tight: { desktop: '12px', phone: '8px' },
  flow: { desktop: '32px', phone: '24px' },
  section: { desktop: '48px', phone: '32px' },
} as const;

export const getBoundaryMargin = (
  previousRole: WidgetRole | undefined,
  role: WidgetRole | undefined,
  isPhone: boolean
): string | undefined => {
  if (!previousRole || !role) return undefined;

  const size = isPhone ? 'phone' : 'desktop';

  if (previousRole === 'band' && role === 'band') return '0px';
  if (previousRole === 'band' || role === 'band') {
    return BOUNDARY_MARGINS.section[size];
  }
  if (previousRole === 'card' && role === 'card') {
    return BOUNDARY_MARGINS.tight[size];
  }
  return BOUNDARY_MARGINS.flow[size];
};

// Margin above the current craft node, derived from the roles of the node and
// its previous sibling. Undefined when rhythm is off for this builder, the
// node has no role (regions, columns' inner containers), or it comes first.
export const useVerticalRhythmMargin = (): string | undefined => {
  const rhythmEnabled = useContext(VerticalRhythmContext);
  const isPhone = useBreakpoint('phone');
  const { id, name, parent } = useNode((node) => ({
    name: node.data.name,
    parent: node.data.parent,
  }));
  const { query } = useEditor();

  if (!rhythmEnabled || !parent) return undefined;

  const siblingIds = query.node(parent).get().data.nodes;
  const index = siblingIds.indexOf(id);
  if (index <= 0) return undefined;

  const previousName = query.node(siblingIds[index - 1]).get().data.name;

  return getBoundaryMargin(
    WIDGET_ROLES[previousName],
    WIDGET_ROLES[name],
    isPhone
  );
};
