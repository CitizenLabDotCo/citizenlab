import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

export const SectionContainer = styled.div`
  padding-top: 70px;
  margin-bottom: 70px;
  border-top: solid 1px #ccc;
`;

export const SectionTitle = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
`;
