import '@testing-library/jest-dom';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

jest.mock('polished');
jest.mock('modules');
jest.mock('quill-blot-formatter');
