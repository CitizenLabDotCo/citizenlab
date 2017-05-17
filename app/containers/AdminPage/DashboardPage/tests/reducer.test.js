import { fromJS } from 'immutable';
import { stringMock, objectMock } from 'utils/testing/constants';

import dashboardPage, { initialState, setInForReport } from '../reducer';
import { loadUsersReportError, loadUsersReportRequest, loadUsersReportSuccess } from '../actions';


describe('dashboardPage', () => {
  const expectedInitialState = initialState;

  it('returns the initial state', () => {
    expect(dashboardPage(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('setInForReport', () => {
    describe('request', () => {
      it('should set loading=true, loadError null', () => {
        const nextState = setInForReport(
          fromJS(expectedInitialState), loadUsersReportRequest(stringMock, stringMock, stringMock), 'newUsers', 'request').toJS();
        expect(nextState.newUsers.loading).toBeTruthy();
        expect(nextState.newUsers.loadError).toBeNull();
      });
    });

    describe('success', () => {
      it('should set loading=false and data not null', () => {
        const nextState = setInForReport(
          fromJS(expectedInitialState), loadUsersReportSuccess(objectMock), 'newUsers', 'success').toJS();
        expect(nextState.newUsers.loading).toBeFalsy();
        expect(nextState.newUsers.data).not.toBeNull();
      });
    });

    describe('error', () => {
      it('should set loading=false, loadError not null', () => {
        const nextState = setInForReport(
          fromJS(expectedInitialState), loadUsersReportError(stringMock), 'newUsers', 'error').toJS();
        expect(nextState.newUsers.loading).toBeFalsy();
        expect(nextState.newUsers.loadError).not.toBeNull();
      });
    });
  });
});
