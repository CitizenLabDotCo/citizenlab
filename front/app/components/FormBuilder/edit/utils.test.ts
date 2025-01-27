import { IFlatCustomField } from 'api/custom_fields/types';

import {
  NestedGroupingStructure,
  detectConflictsByPage,
  ConflictType,
} from './utils';

// Utility to quickly create a question with specific logic rules
function makeQuestion(
  id: string,
  inputType: string,
  rules: { goto_page_id: string }[] = []
): IFlatCustomField {
  return {
    id,
    input_type: inputType,
    logic: { rules },
  } as IFlatCustomField;
}

// Utility to create a group (representing one "page")
function makeGroup(
  pageId: string,
  pageLogic: { next_page_id?: string } = {},
  questions: IFlatCustomField[]
): NestedGroupingStructure {
  return {
    groupElement: {
      id: pageId,
      input_type: 'page',
      logic: pageLogic,
    } as IFlatCustomField,
    questions,
    id: pageId,
  };
}

describe('detectConflictsByPage', () => {
  it('should detect MULTIPLE_GOTO_IN_MULTISELECT conflict when a multiselect question has multiple distinct goto_page_ids', () => {
    // multiselect question with 2 different goto IDs
    const question = makeQuestion('q1', 'multiselect', [
      { goto_page_id: 'page2' },
      { goto_page_id: 'page3' },
    ]);

    const groupedData: NestedGroupingStructure[] = [
      makeGroup('page1', {}, [question]),
    ];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toBeDefined();
    expect(conflicts['page1']?.[0].conflictType).toBe(
      ConflictType.MULTIPLE_GOTO_IN_MULTISELECT
    );
  });

  it('should NOT detect MULTIPLE_GOTO_IN_MULTISELECT if only one distinct goto_page_id is used', () => {
    // multiselect question but all rules point to the same page
    const question = makeQuestion('q1', 'multiselect_image', [
      { goto_page_id: 'page2' },
      { goto_page_id: 'page2' },
    ]);

    const groupedData: NestedGroupingStructure[] = [
      makeGroup('page1', {}, [question]),
    ];

    const conflicts = detectConflictsByPage(groupedData);
    // Expect no conflicts for page1
    expect(conflicts['page1']).toBeUndefined();
  });

  it('should detect QUESTION_VS_PAGE_LOGIC conflict if a page next_page_id differs from a question goto_page_id', () => {
    const question = makeQuestion('q1', 'select', [{ goto_page_id: 'page2' }]);
    // Page logic says next_page_id = 'page3'
    const groupedData: NestedGroupingStructure[] = [
      makeGroup('page1', { next_page_id: 'page3' }, [question]),
    ];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toBeDefined();
    expect(conflicts['page1']?.[0].conflictType).toBe(
      ConflictType.QUESTION_VS_PAGE_LOGIC
    );
  });

  it('should NOT detect QUESTION_VS_PAGE_LOGIC if page has no next_page_id', () => {
    // If pageNextId is undefined, no conflict is possible in this category
    const question = makeQuestion('q1', 'select', [{ goto_page_id: 'page2' }]);
    const groupedData = [makeGroup('page1', {}, [question])];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toBeUndefined();
  });

  it('should detect INTER-QUESTION_CONFLICT if two or more questions in a single page have goto_page_id', () => {
    const question1 = makeQuestion('q1', 'select', [{ goto_page_id: 'page2' }]);
    const question2 = makeQuestion('q2', 'select', [{ goto_page_id: 'page3' }]);

    const groupedData = [makeGroup('page1', {}, [question1, question2])];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toBeDefined();
    expect(conflicts['page1']?.[0].conflictType).toBe(
      ConflictType.INTER_QUESTION_CONFLICT
    );
  });

  it('should NOT detect INTER-QUESTION_CONFLICT if only zero or one question has goto_page_id', () => {
    const question1 = makeQuestion('q1', 'select', []); // no goto
    const question2 = makeQuestion('q2', 'select', [{ goto_page_id: 'page2' }]);
    // Only one question with goto => no conflict
    const groupedData = [makeGroup('page1', {}, [question1, question2])];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toBeUndefined();
  });

  it('should aggregate multiple conflict types on the same page if they occur simultaneously', () => {
    // For example, a page-level mismatch plus two questions with goto
    const question1 = makeQuestion('q1', 'select', [{ goto_page_id: 'page2' }]);
    const question2 = makeQuestion('q2', 'select', [{ goto_page_id: 'page3' }]);
    // Page logic says next_page_id = 'page5'
    const groupedData = [
      makeGroup('page1', { next_page_id: 'page5' }, [question1, question2]),
    ];

    const conflicts = detectConflictsByPage(groupedData);
    expect(conflicts['page1']).toHaveLength(3);
    const conflictTypes = conflicts['page1']?.map((c) => c.conflictType);
    expect(conflictTypes).toContain(ConflictType.QUESTION_VS_PAGE_LOGIC);
    expect(conflictTypes).toContain(ConflictType.INTER_QUESTION_CONFLICT);
  });
});
