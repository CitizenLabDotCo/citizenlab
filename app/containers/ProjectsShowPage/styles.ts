import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

export const SectionContainer = styled.div`
  padding-top: 70px;
  margin-bottom: 70px;
`;

export const ContinuosProjectSectionTitle = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
`;

export const TimelineProjectSectionTitle = styled(
  ContinuosProjectSectionTitle
)``;
