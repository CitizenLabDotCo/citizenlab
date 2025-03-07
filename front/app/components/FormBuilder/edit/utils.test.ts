import { IFlatCustomField } from 'api/custom_fields/types';

import {
  LogicConflictType,
  detectConflictsByPage,
  getReorderedFields,
  NestedGroupingStructure,
} from './utils';

describe('getReorderedFields', () => {
  const nestedGroupData = [
    {
      groupElement: {
        id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
      },
      questions: [
        {
          id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
        },
        {
          id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
        },
      ],
      id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
    },
    {
      groupElement: {
        id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
      },
      questions: [
        {
          id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
        },
        {
          id: 'fac04300-1574-44b0-9ba2-2361195beab0',
        },
      ],
      id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
    },
    {
      groupElement: {
        id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      },
      questions: [
        {
          id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
        },
        {
          id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
        },
        {
          id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
        },
      ],
      id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
    },
  ];

  it('correctly reorders section', () => {
    const result = {
      draggableId: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      type: 'droppable-page',
      source: {
        index: 2,
        droppableId: 'droppable',
      },
      reason: 'DROP',
      mode: 'FLUID',
      destination: {
        droppableId: 'droppable',
        index: 1,
      },
      combine: null,
    };

    const output = [
      {
        id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
      },
      {
        id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
      },
      {
        id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
      },
      {
        id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      },
      {
        id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
      },
      {
        id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
      },
      {
        id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
      },
      {
        id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
      },
      {
        id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
      },
      {
        id: 'fac04300-1574-44b0-9ba2-2361195beab0',
      },
    ];

    expect(getReorderedFields(result, nestedGroupData as any)).toEqual(output);
  });

  it('correctly reorders question within same page', () => {
    const result = {
      draggableId: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
      type: 'droppable-question',
      source: {
        index: 1,
        droppableId: '7d3f530e-d365-4a50-b713-3346f9ac9201',
      },
      reason: 'DROP',
      mode: 'FLUID',
      destination: {
        droppableId: '7d3f530e-d365-4a50-b713-3346f9ac9201',
        index: 0,
      },
      combine: null,
    };

    const output = [
      {
        id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
      },
      {
        id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
      },
      {
        id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
      },
      {
        id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
      },
      {
        id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
      },
      {
        id: 'fac04300-1574-44b0-9ba2-2361195beab0',
      },
      {
        id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      },
      {
        id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
      },
      {
        id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
      },
      {
        id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
      },
    ];

    expect(getReorderedFields(result, nestedGroupData as any)).toEqual(output);
  });

  it('correctly reorders question to different page', () => {
    const result = {
      draggableId: '32b94f84-2f9e-4036-86d6-f23c3529b282',
      type: 'droppable-question',
      source: {
        index: 1,
        droppableId: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      },
      reason: 'DROP',
      mode: 'FLUID',
      destination: {
        droppableId: '7d3f530e-d365-4a50-b713-3346f9ac9201',
        index: 1,
      },
      combine: null,
    };

    const output = [
      {
        id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
      },
      {
        id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
      },
      {
        id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
      },
      {
        id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
      },
      {
        id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
      },
      {
        id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
      },
      {
        id: 'fac04300-1574-44b0-9ba2-2361195beab0',
      },
      {
        id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
      },
      {
        id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
      },
      {
        id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
      },
    ];

    expect(getReorderedFields(result, nestedGroupData as any)).toEqual(output);
  });
});

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
      LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT
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
      LogicConflictType.QUESTION_VS_PAGE_LOGIC
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
      LogicConflictType.INTER_QUESTION_CONFLICT
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
    expect(conflicts['page1']).toHaveLength(2);
    const conflictTypes = conflicts['page1']?.map((c) => c.conflictType);
    expect(conflictTypes).toContain(LogicConflictType.QUESTION_VS_PAGE_LOGIC);
    expect(conflictTypes).toContain(LogicConflictType.INTER_QUESTION_CONFLICT);
  });
});
