import { bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const CheckOption = styled.div`
  border-radius: ${bo.borderRadius};
  font-size: 13px;
  line-height: 1.5;
  color: ${bo.colors.textHeadingStrong};

  &:hover {
    background: ${colors.grey100};
  }

  .e2e-checkbox:not(.checked) {
    opacity: 0;
    transition: opacity 0.1s;
  }

  &:hover .e2e-checkbox,
  input.focus-visible + .e2e-checkbox {
    opacity: 1;
  }
`;

export default CheckOption;
