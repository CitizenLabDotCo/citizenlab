import { createContext, useContext } from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import { PageActionBlocker, PageGroup, QuestionPosition } from './utils';

export const DND_QUESTION = 'form-builder-new/question';
export const DND_PAGE = 'form-builder-new/page';

export type DragItem = { id: string };

// How long a dragged question has to hover a page in the page list before
// that page opens in the canvas.
export const PAGE_SWITCH_HOVER_DELAY = 500;

type BuilderContextValue = {
  fields: IFlatCustomField[];
  // Read-only demographics page, shown before the ending page.
  userPage: PageGroup | null;
  currentPageId: string | undefined;
  showPage: (pageId: string) => void;

  selectedFieldId: string | undefined;
  selectField: (fieldId: string) => void;
  erroredFieldIds: ReadonlySet<string>;

  // Where a dragged question would land if dropped now.
  dropTarget: QuestionPosition | null;
  setDropTarget: (target: QuestionPosition | null) => void;
  dropQuestion: (questionId: string, target?: QuestionPosition) => void;
  dropPage: (pageId: string, targetPageIndex: number) => void;

  openAddModal: (position?: QuestionPosition) => void;
  duplicateField: (fieldId: string) => void;
  deleteField: (fieldId: string) => void;
  duplicatePage: (pageId: string) => void;
  // Why a page can't be deleted/duplicated, or null when it can.
  getPageBlocker: (
    action: 'delete' | 'duplicate',
    pageId: string
  ) => PageActionBlocker | null;
  closeSettings: (triggerAutosave?: boolean) => void;
};

export const BuilderContext = createContext<BuilderContextValue | null>(null);

export const useBuilder = () => {
  const value = useContext(BuilderContext);
  if (!value) {
    throw new Error('useBuilder must be used within the FormBuilderNew');
  }
  return value;
};
