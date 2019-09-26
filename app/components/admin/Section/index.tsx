import styled from 'styled-components';
import { remCalc, colors, fontSizes, media } from 'utils/styleUtils';

export const Section = styled.div`
  margin-bottom: 0;
`;

export const SubSection = styled.section`
  margin-left: 1.5em;
  margin-bottom: 0;
`;

export const SubSectionTitle = styled.h3`
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  line-height: ${remCalc(30)};
  display: flex;
  align-items: center;

  & > :not(last-child) {
    margin-right: 7px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: ${remCalc(32)};
  margin-bottom: ${remCalc(45)};
`;

export const SectionSubtitle = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-size: ${fontSizes.base}px;
  margin-bottom: ${remCalc(45)};
  font-weight: 400;
  max-width: 60em;

  ${SectionTitle} + &{
    margin-top: -2rem;
  }
`;

export const PageTitle =  styled.h1`
  font-size: ${fontSizes.xxxl}px;
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
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
    border-radius: ${(props: any) => props.theme.borderRadius};
    // border: solid 1px ${(props: any) => props.error ? props.theme.colors.clRedError : '#ccc'};
    border: solid 1px ${(props: any) => props.error ? props.theme.colors.clRedError : '#888'};
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    font-size: ${fontSizes.base}px;
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
