import { fontSizes, isRtl } from 'utils/styleUtils';
import styled from 'styled-components';

export const maxPageWidth = 1166;

export const ProjectPageSectionTitle = styled.h2`
  color: ${(props: any) => props.theme.colors.tenantText};
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

  ${isRtl`
    text-align: right;
  `}
`;
