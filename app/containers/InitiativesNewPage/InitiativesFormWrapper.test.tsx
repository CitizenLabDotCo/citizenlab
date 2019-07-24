import React from 'react';

import { shallow } from 'enzyme';

jest.mock('components/InitiativeForm', () => 'InitiativeForm');
jest.mock('services/initiatives'); // TODO
jest.mock('services/initiativeImages', () => { }); // TODO
jest.mock('services/initiativeFiles', () => { }); // TODO

jest.mock('utils/cl-router/history');
jest.mock('utils/locationTools');
jest.mock('utils/loggingUtils');

import { addInitiative, updateInitiative } from 'services/initiatives';

import InitiativesFormWrapper from './InitiativesFormWrapper';

describe('InitiativesNewPage', () => {
  jest.useRealTimers();

  // it('is ready for testing', () => {
  //   const Wrapper = shallow(
  //     <InitiativesFormWrapper locale="en" />
  //   );
  //
  //   expect(Wrapper).toMatchSnapshot();
  // });

  it('creates an initiative on mounting', (done) => {

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {// lets the component finish componentWillMount before starting the test
      expect(addInitiative).toHaveBeenCalledTimes(1);
      expect(addInitiative).toHaveBeenNthCalledWith(1, { publication_status: 'draft' });

      expect(Wrapper.state('initiativeId')).toBe('initiativeID'); // cf mock of initiative service
      done();
    }, 1);
  });

  it('handles title changes and saves them', (done) => {
    updateInitiative.mockImplementation(() => Promise.resolve({ data: { title_multiloc: { en: 'New Title' } } }));

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onChangeTitle')({ en: 'New Title' });
      Wrapper.update();
      expect(Wrapper.state('title_multiloc')['en']).toBe('New Title'); // cf mock of initiative service
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onSave')();

      setTimeout(() => {
        expect(updateInitiative).toHaveBeenCalledTimes(1);
        expect(updateInitiative).toHaveBeenNthCalledWith(1, 'initiativeID', { title_multiloc: { en: 'New Title' } });
        expect(Wrapper.update().find('InitiativesFormWrapper__StyledInitiativeForm').prop('title_multiloc')).toEqual({ en: 'New Title' });
        done();
      }, 1);
    }, 1);
  });

  it('handles body changes and saves them', (done) => {
    updateInitiative.mockImplementation(() => Promise.resolve({ data: { body_multiloc: { en: 'New Body' } } }));

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onChangeBody')({ en: 'New Body' });
      Wrapper.update();
      expect(Wrapper.state('body_multiloc')['en']).toBe('New Body');
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onSave')();
      setTimeout(() => {
        expect(updateInitiative).toHaveBeenCalledTimes(1);
        expect(updateInitiative).toHaveBeenNthCalledWith(1, 'initiativeID', { body_multiloc: { en: 'New Body' } });
        expect(Wrapper.update().find('InitiativesFormWrapper__StyledInitiativeForm').prop('body_multiloc')).toEqual({ en: 'New Body' });
        done();
      }, 1);
    }, 1);
  });

  it('handles topics changes and saves them', (done) => {
    updateInitiative.mockImplementation(() => Promise.resolve({ data: { topic_ids: { en: 'New Body' } } }));

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onChangeTopics')(['topic1', 'topic2']);
      Wrapper.update();
      expect(Wrapper.state('topic_ids')).toEqual(['topic1', 'topic2']);
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onSave')();

      setTimeout(() => {
        expect(updateInitiative).toHaveBeenCalledTimes(1);
        expect(updateInitiative).toHaveBeenNthCalledWith(1, 'initiativeID', { topic_ids: ['topic1', 'topic2'] });
        expect(Wrapper.update().find('InitiativesFormWrapper__StyledInitiativeForm').prop('topic_ids')).toEqual(['topic1', 'topic2']);
        done();
      }, 1);
    }, 1);
  });

  it('handles topics changes and saves them', (done) => {
    updateInitiative.mockImplementation(() => Promise.resolve({ data: { topic_ids: { en: 'New Body' } } }));

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onChangeTopics')(['topic1', 'topic2']);
      Wrapper.update();
      expect(Wrapper.state('topic_ids')).toEqual(['topic1', 'topic2']);
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onSave')();

      setTimeout(() => {
        expect(updateInitiative).toHaveBeenCalledTimes(1);
        expect(updateInitiative).toHaveBeenNthCalledWith(1, 'initiativeID', { topic_ids: ['topic1', 'topic2'] });
        expect(Wrapper.update().find('InitiativesFormWrapper__StyledInitiativeForm').prop('topic_ids')).toEqual(['topic1', 'topic2']);
        done();
      }, 1);
    }, 1);
  });

  it('handles location changes, formats the location and and saves', (done) => {
    updateInitiative.mockImplementation(() => Promise.resolve({ data: { topic_ids: { en: 'New Body' } } }));

    const Wrapper = shallow(
      <InitiativesFormWrapper locale="en" />
    );

    setTimeout(() => {
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onChangePosition')('Location description');
      Wrapper.update();
      expect(Wrapper.state('position')).toEqual('Location description');
      Wrapper.find('InitiativesFormWrapper__StyledInitiativeForm').prop('onSave')();

      setTimeout(() => {
        expect(updateInitiative).toHaveBeenCalledTimes(1);
        expect(updateInitiative).toHaveBeenNthCalledWith(1, 'initiativeID', {
          location_description: 'Location description',
          location_point_geojson: { type: 'point', coordinates: ['coor', 'dinates'] }}); // CF convertToGeoJson mock in locationTools
        expect(Wrapper.update().find('InitiativesFormWrapper__StyledInitiativeForm').prop('position')).toEqual('Location description');
        done();
      }, 1);
    }, 1);
  });

});
