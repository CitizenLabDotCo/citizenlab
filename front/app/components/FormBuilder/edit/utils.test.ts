import { getReorderedFields } from './utils';

describe('getReorderedFields', () => {
  describe('idea form', () => {
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

      expect(getReorderedFields(result, nestedGroupData as any)).toEqual(
        output
      );
    });
  });
});
