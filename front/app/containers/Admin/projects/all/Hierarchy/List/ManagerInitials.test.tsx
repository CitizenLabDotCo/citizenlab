import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ManagerInitials from './ManagerInitials';

describe('ManagerInitials', () => {
  it("shows each manager's initials, and reads out their names", () => {
    render(
      <ManagerInitials
        managers={[
          { first_name: 'Fernando', last_name: 'Creemers' },
          { first_name: 'aisha', last_name: 'Bakker' },
        ]}
      />
    );

    expect(screen.getByText('FC')).toBeInTheDocument();
    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(
      screen.getByText('Fernando Creemers, aisha Bakker')
    ).toBeInTheDocument();
  });

  it('shows a manager without a name as a person, and says so', () => {
    const { container } = render(
      <ManagerInitials
        managers={[
          { avatar: undefined },
          { first_name: '  ', avatar: undefined },
        ]}
      />
    );

    expect(
      screen.getByText('Manager without a name, Manager without a name')
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.cl-icon')).toHaveLength(2);
  });

  it('leaves the cell empty without managers', () => {
    render(<ManagerInitials managers={[]} />);

    // The test providers wrap what's rendered in an element of their own.
    expect(document.getElementById('modal-portal')).toBeEmptyDOMElement();
  });
});
