import styled from 'styled-components';
import { remCalc, colors, fontSizes, isRtl } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

export const Section = styled.div`
  margin-bottom: 0;
`;

export const SubSection = styled.section`
  margin-left: 1.5em;
  margin-bottom: 0;
`;

export const SectionField = styled.div`
  margin-bottom: 35px;
  transition: all 200ms ease-in-out;
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;

  &.fullWidth {
    max-width: 100%;
  }

  .editor {
    width: 120%;
  }

  ${isRtl`
    align-items: flex-end;
  `}
`;

export const PageTitle = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

export const SectionTitle = styled.h2`
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  line-height: ${remCalc(32)};
  margin-bottom: ${remCalc(45)};
`;

export const SubSectionTitle = styled.h3`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  line-height: ${remCalc(30)};
  display: flex;
  align-items: center;

  & > :not(last-child) {
    margin-right: 7px;
  }
`;

export const SubSectionTitleWithDescription = styled(SubSectionTitle)`
  margin-bottom: 5px;
`;

export const SectionDescription = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-size: ${fontSizes.base}px;
  margin-bottom: ${remCalc(45)};
  font-weight: 400;
  max-width: 60em;

  ${SectionTitle} + & {
    margin-top: -2rem;
  }
`;

export const StyledLink = styled(Link)`
  text-decoration: underline;
`;
