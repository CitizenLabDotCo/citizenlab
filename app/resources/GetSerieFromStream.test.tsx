import React from 'react';
import { shallow } from 'enzyme';
import GetSerieFromStream, { ISupportedDataType } from './GetSerieFromStream';
import { BehaviorSubject } from 'rxjs';

jest.mock('services/areas');

let mockData: ISupportedDataType | null | undefined = null;

const stream = jest.fn(({ queryParameters }, customId: string) => {
  const observable = new BehaviorSubject(mockData);
  return {
    observable
  };
});

describe('<GetSerieFromStream />', () => {

  let child: jest.Mock;
  let convertToGraphFormat: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
    convertToGraphFormat = jest.fn();
  });

  it('calls the given stream with the given query parameters', () => {
    shallow(
      <GetSerieFromStream
        convertToGraphFormat={convertToGraphFormat}
        stream={stream}
        startAt="startDate"
        endAt={null}
        currentProjectFilter="testProject"
      >
        {child}
      </GetSerieFromStream>
    );
    expect(stream.mock.calls[0][0]).toEqual({
      queryParameters: {
        end_at: null,
        group: undefined,
        project: 'testProject',
        start_at: 'startDate',
        topic: undefined
      }
    });
  });

  it('calls the given stream with the given extra parameters', () => {
    shallow(
      <GetSerieFromStream
        convertToGraphFormat={convertToGraphFormat}
        stream={stream}
        startAt="startDate"
        endAt={null}
        customId="customId"
      >
        {child}
      </GetSerieFromStream>
    );
    expect(stream.mock.calls[0]).toEqual([{
      queryParameters: {
        end_at: null,
        group: undefined,
        project: undefined,
        start_at: 'startDate',
        topic: undefined
      }
    }, 'customId']);
  });

  it('doesn\'t calls convertToGraphFormat function if there is no data', () => {
    shallow(
      <GetSerieFromStream
        convertToGraphFormat={convertToGraphFormat}
        stream={stream}
        startAt="startDate"
        endAt={null}
      >
        {child}
      </GetSerieFromStream>
    );
    expect(convertToGraphFormat).toBeCalledTimes(0);
  });

  it('calls convertToGraphFormat function if there is data', () => {
    mockData = {
      series: {
        comments: {
          topic1: 25,
          topic2: 5,
          topic3: 0,
        }
      },
      topics: {
        topic1: {
          title_multiloc: {
            en: 'Topic 1',
            'fr-BE': 'Theme 1'
          }
        },
        topic2: {
          title_multiloc: {
            en: 'Topic 2',
            'fr-BE': 'Theme 2'
          }
        },
        topic3: {
          title_multiloc: {
            en: 'Topic 3',
            'fr-BE': 'Theme 3'
          }
        },
      },
    };
    shallow(
      <GetSerieFromStream
        convertToGraphFormat={convertToGraphFormat}
        stream={stream}
        startAt="startDate"
        endAt={null}
      >
        {child}
      </GetSerieFromStream>
    );
    expect(convertToGraphFormat).toBeCalledTimes(1);
  });

});
