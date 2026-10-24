// Storybook's stand-in for utils/cl-router/Link: the shared test mock (a
// plain <a> with the route filled in), with typedStyled styling it the way
// the real helper does. The test mock passes the component through
// unstyled, which left styled links (a phase's view switch, say) looking
// like plain text in stories.
import styled from 'styled-components';

import Link from '../../app/utils/cl-router/__mocks__/Link';

export const typedStyled = (component: any) => styled(component);

export default Link;
