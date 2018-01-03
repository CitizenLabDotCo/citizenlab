import styled from 'styled-components';
import { remCalc, color, fontSize, media } from 'utils/styleUtils';

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
  font-size: ${fontSize('base')};
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

  .TextArea {
    max-width: 500px;
  }

  input,
  textarea {
    -webkit-appearance: none;
    background: #fff;
    border-radius: 5px;
    border: solid 1px ${(props: any) => props.error ? props.theme.colors.error : '#ccc'};
    box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.1);
    color: ${color('text')};
    font-size: ${fontSize('base')};
    font-weight: 400;
    line-height: 24px;
    max-width: 500px;
    outline: none;
    padding: 12px;
    width: 100%;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'};
    }

    ${media.biggerThanPhone`
      padding-right: ${props => props.error && '40px'};
    `}
  }

  .editor {
    max-width: 600px;
  }

  .Select {
    max-width: 470px;
  }
`;
