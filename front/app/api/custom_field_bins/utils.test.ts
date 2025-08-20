import { ICustomFieldBins } from './types';
import { deduplicateBins } from './utils';

describe('deduplicateBins', () => {
  it('should deduplicate AgeBins with the same range', () => {
    const input: ICustomFieldBins['data'] = [
      {
        id: '14c331b7-e337-4338-b69f-a7c6470a6005',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.911Z',
          updated_at: '2025-06-26T19:11:03.911Z',
          range: {
            begin: 0,
            end: 20,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: '2986ae8c-5baf-4827-8c03-d59c9046a102',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.914Z',
          updated_at: '2025-06-26T19:11:03.914Z',
          range: {
            begin: 0,
            end: 20,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: '34c71199-2a50-4709-b6f7-3abcf31b5398',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.920Z',
          updated_at: '2025-06-26T19:11:03.920Z',
          range: {
            begin: 0,
            end: 20,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'cd5faa4f-5732-4e02-ba60-e2e08d3d7531',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.921Z',
          updated_at: '2025-06-26T19:11:03.921Z',
          range: {
            begin: 20,
            end: 40,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'afdfcdd2-41c6-4979-a47c-eb55c4b64374',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.924Z',
          updated_at: '2025-06-26T19:11:03.924Z',
          range: {
            begin: 20,
            end: 40,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: '2d5315cd-3a76-4e8a-ade9-2346df2a5b75',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.927Z',
          updated_at: '2025-06-26T19:11:03.927Z',
          range: {
            begin: 20,
            end: 40,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'df51b5ab-529f-41e5-a788-718d35fb5e9a',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.929Z',
          updated_at: '2025-06-26T19:11:03.929Z',
          range: {
            begin: 40,
            end: 60,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'c7718c78-4cdb-4b33-8e1f-b38283ebaeda',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.930Z',
          updated_at: '2025-06-26T19:11:03.930Z',
          range: {
            begin: 40,
            end: 60,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'ee720bb8-f11f-4f36-ae72-44bafe5134d2',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.936Z',
          updated_at: '2025-06-26T19:11:03.936Z',
          range: {
            begin: 40,
            end: 60,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'a265b428-cdfd-4133-bcac-c9e33f3f1847',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.937Z',
          updated_at: '2025-06-26T19:11:03.937Z',
          range: {
            begin: 60,
            end: 80,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'c79df49c-104d-46ca-9717-1f52102c144f',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.938Z',
          updated_at: '2025-06-26T19:11:03.938Z',
          range: {
            begin: 60,
            end: 80,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'f8d85111-01c3-48cb-ac9f-ce4069a48c2d',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.944Z',
          updated_at: '2025-06-26T19:11:03.944Z',
          range: {
            begin: 80,
            end: null,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'a2ede42f-d729-4992-add0-8ebb7eca022a',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.945Z',
          updated_at: '2025-06-26T19:11:03.945Z',
          range: {
            begin: 80,
            end: null,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: '6057943a-c44a-4fcf-8563-c5ad2c47893c',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.946Z',
          updated_at: '2025-06-26T19:11:03.946Z',
          range: {
            begin: 60,
            end: 80,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
      {
        id: 'e2a61d30-4bb9-4260-9353-34898424cbad',
        type: 'custom_field_bin',
        attributes: {
          type: 'CustomFieldBins::AgeBin',
          values: null,
          created_at: '2025-06-26T19:11:03.973Z',
          updated_at: '2025-06-26T19:11:03.973Z',
          range: {
            begin: 80,
            end: null,
          },
        },
        relationships: {
          custom_field: {
            data: {
              id: 'ea6d4bd8-8540-43df-a4ce-30d15a91a3bd',
              type: 'custom_field',
            },
          },
          custom_field_option: {
            data: null,
          },
        },
      },
    ];

    const expectedOutput: ICustomFieldBins['data'] = [
      input[0],
      input[3],
      input[6],
      input[9],
      input[11],
    ];

    const result = deduplicateBins(input);
    expect(result).toEqual(expectedOutput);
  });
});
