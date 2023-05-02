// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import GetSerieFromStream, { ISupportedDataType } from './GetSerieFromStream';
import { BehaviorSubject } from 'rxjs';

jest.mock('api/areas/types');

let mockData: ISupportedDataType | null | undefined = null;

const stream = jest.fn((_parameters, _customId: string) => {
  const observable = new BehaviorSubject(mockData);
  return {
    observable,
  };
});

describe('<GetSerieFromStream />', () => {
  let child: jest.Mock;
  let convertToGraphFormat: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
    convertToGraphFormat = jest.fn();
  });

  it('queries with the right parameters and update', () => {
    const component = shallow(
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
    expect(stream).toHaveBeenCalledTimes(1);
    expect(stream.mock.calls[0][0]).toEqual({
      queryParameters: {
        end_at: null,
        group: undefined,
        project: 'testProject',
        start_at: 'startDate',
        topic: undefined,
      },
    });
    component.setProps({ startAt: 'nextDate' });
    expect(stream).toHaveBeenCalledTimes(2);
    expect(stream.mock.calls[1][0]).toEqual({
      queryParameters: {
        end_at: null,
        group: undefined,
        project: 'testProject',
        start_at: 'nextDate',
        topic: undefined,
      },
    });
  });

  it('calls the given stream with the given extra parameter', () => {
    shallow(
      <GetSerieFromStream
        convertToGraphFormat={convertToGraphFormat}
        stream={stream}
        startAt="startDate"
        endAt="endDate"
        customId="customId"
        currentGroupFilter="groupID"
        currentTopicFilter="topicID"
        currentProjectFilter="projectID"
      >
        {child}
      </GetSerieFromStream>
    );
    expect(stream.mock.calls[0]).toEqual([
      {
        queryParameters: {
          start_at: 'startDate',
          end_at: 'endDate',
          group: 'groupID',
          project: 'projectID',
          topic: 'topicID',
        },
      },
      'customId',
    ]);
  });

  it("doesn't calls convertToGraphFormat function if there is no data", () => {
    mockData = null;
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
        },
      },
      topics: {
        topic1: {
          title_multiloc: {
            en: 'Topic 1',
            'fr-BE': 'Theme 1',
          },
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
    expect(convertToGraphFormat.mock.calls[0][0]).toBe(mockData);
  });

  it('passes down result of convertToGraphFormat to the child', () => {
    convertToGraphFormat = jest.fn((data) => ({
      comments: data.series.comments,
    }));
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
    mockData = {
      series: {
        comments: {
          topic1: 25,
        },
      },
      topics: {
        topic1: {
          title_multiloc: {
            en: 'Topic 1',
            'fr-BE': 'Theme 1',
          },
        },
      },
    };
    expect(child).toBeCalledWith({ serie: { comments: { topic1: 25 } } });
  });
});
