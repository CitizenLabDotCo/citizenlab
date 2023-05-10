// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';

import { makeUser } from 'services/__mocks__/users';

// mocking dependencies
jest.mock('resources/GetUsers', () => 'GetUsers');
jest.mock('resources/GetAuthUser', () => 'GetAuthUser');

import { AssigneeFilter } from './AssigneeFilter';

describe('<AssigneeFilter />', () => {
  let handleAssigneeFilterChange: jest.Mock;
  beforeEach(() => {
    handleAssigneeFilterChange = jest.fn();
  });

  it('processes options correctly', () => {
    const authUser = makeUser({ roles: [{ type: 'admin' }] }, 'me').data;
    const prospectAssignees = ['admin1', 'admin2', 'admin3'].map(
      (name) =>
        makeUser(
          { slug: name, first_name: name, roles: [{ type: 'admin' }] },
          name
        ).data
    );
    prospectAssignees.push(authUser);

    const wrapper = shallow(
      <AssigneeFilter
        handleAssigneeFilterChange={handleAssigneeFilterChange}
        prospectAssignees={{ usersList: prospectAssignees }}
        assignee="me"
      />
    );
    expect(wrapper.find('Dropdown').prop('options')).toMatchSnapshot();
  });

  it('passes the user ID to handleAssigneeOnChange', () => {
    const authUser = makeUser({ roles: [{ type: 'admin' }] }, 'me').data;
    const prospectAssignees = ['admin1', 'admin2', 'admin3'].map(
      (name) =>
        makeUser(
          { slug: name, first_name: name, roles: [{ type: 'admin' }] },
          name
        ).data
    );
    prospectAssignees.push(authUser);

    const wrapper = shallow(
      <AssigneeFilter
        handleAssigneeFilterChange={handleAssigneeFilterChange}
        prospectAssignees={{ usersList: prospectAssignees }}
        assignee="me"
      />
    );
    const options = wrapper.find('Dropdown').prop('options');
    const pickedOption = options.find((option) => option.value === 'admin1');
    wrapper.instance().onAssigneeChange({}, pickedOption);
    expect(handleAssigneeFilterChange).toHaveBeenCalledTimes(1);
    expect(handleAssigneeFilterChange).toHaveBeenCalledWith('admin1');
  });

  it('passes down unassigned if you select Unassigned', () => {
    const authUser = makeUser({ roles: [{ type: 'admin' }] }, 'me').data;
    const prospectAssignees = ['admin1', 'admin2', 'admin3'].map(
      (name) =>
        makeUser(
          { slug: name, first_name: name, roles: [{ type: 'admin' }] },
          name
        ).data
    );
    prospectAssignees.push(authUser);

    const wrapper = shallow(
      <AssigneeFilter
        handleAssigneeFilterChange={handleAssigneeFilterChange}
        prospectAssignees={{ usersList: prospectAssignees }}
        assignee="me"
      />
    );
    const options = wrapper.find('Dropdown').prop('options');
    const unassigned = options.find((option) => option.value === 'unassigned');
    wrapper.instance().onAssigneeChange({}, unassigned);
    expect(handleAssigneeFilterChange).toHaveBeenCalledTimes(1);
    expect(handleAssigneeFilterChange).toHaveBeenCalledWith('unassigned');
  });
});
