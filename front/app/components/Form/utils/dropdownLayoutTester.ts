import { Tester } from '@jsonforms/core';

const dropdownLayoutTester: Tester = (uischema) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return uischema?.options?.dropdown_layout || false;
};

export default dropdownLayoutTester;
