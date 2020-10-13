import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

export const SectionContainer = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;

  ${media.smallerThanMinTablet`
    padding-top: 45px;
    padding-bottom: 45px;
  `}
`;

export const ProjectPageSectionTitle = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
`;
