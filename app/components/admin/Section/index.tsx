import styled from 'styled-components';
import { remCalc, color, fontSize } from 'utils/styleUtils';

export const Section = styled.div`
  margin-bottom: ${remCalc(110)};
`;

export const SectionTitle = styled.h1`
  color: ${color('text')};
  font-size: ${fontSize('xxl')};
  font-weight: 500;
  line-height: ${remCalc(32)};
  margin: 0 0 ${remCalc(30)};
  padding: 0;
`;

export const SectionField = styled.div`
  margin-bottom: ${remCalc(30)};

  input,
  textarea {
    max-width: 500px;
  }

  .editor {
    max-width: 600px;
  }

  .Select {
    max-width: 470px;
  }
`;
