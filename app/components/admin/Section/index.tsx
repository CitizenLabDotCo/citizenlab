import styled from 'styled-components';
import { remCalc, color, fontSize } from 'utils/styleUtils';

export const Section = styled.div`
  margin-bottom: ${remCalc(60)};
`;

export const SectionTitle = styled.h1`
  color: ${color('text')};
  font-size: ${fontSize('xxl')};
  font-weight: 500;
  line-height: ${remCalc(32)};
  margin-bottom: ${remCalc(30)};
`;

export const SectionSubtitle = styled.p`
  color: ${color('label')};
  margin-bottom: ${remCalc(45)};

  ${SectionTitle} + &{
    margin-top: -2rem;
  }
`;

export const SectionField = styled.div`
  margin-bottom: ${remCalc(30)};
  overflow: visible;
  transition: all .2s ease-in-out;
  max-height: auto;

  &.exited {
    max-height: 0;
  }

  &.entering,
  &.exiting {
    max-height: 200px;
  }

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
