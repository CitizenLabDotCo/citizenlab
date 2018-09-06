import styled from 'styled-components';
import { remCalc, colors, fontSize, media } from 'utils/styleUtils';

export const Section = styled.div`
  margin-bottom: 0;
`;

export const SubSection = styled.section`
  margin-left: 1.5em;
  margin-bottom: 0;
`;

export const SectionTitle = styled.h1`
  font-size: ${fontSize('xxl')};
  font-weight: 500;
  line-height: ${remCalc(32)};
  margin-bottom: ${remCalc(30)};
`;

export const SectionSubtitle = styled.p`
  color: ${colors.label};
  font-size: ${fontSize('base')};
  margin-bottom: ${remCalc(45)};

  ${SectionTitle} + &{
    margin-top: -2rem;
  }
`;

export const SectionField = styled.div`
  margin-bottom: ${remCalc(30)};
  transition: all 200ms ease-in-out;
  width: 100%;
  max-width: 500px;

  &.fullWidth {
    max-width: 100%;
  }

  .editor {
    width: 120%;
  }

  .CLInputComponent,
  .CLTextareaComponent {
    width: 100%;
    -webkit-appearance: none;
    background: #fff;
    border-radius: 5px;
    border: solid 1px ${(props: any) => props.error ? props.theme.colors.clRedError : '#ccc'};
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    font-size: ${fontSize('base')};
    font-weight: 400;
    line-height: 24px;
    outline: none;
    padding: 12px;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.clRedError : '#999'};
    }

    ${media.biggerThanPhone`
      padding-right: ${props => props.error && '40px'};
    `}
  }
`;
