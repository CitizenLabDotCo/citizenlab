import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';

export const EventDateBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const EventDateBlockLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.xs}px;
  line-height: normal;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

export const EventDateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #f5f6f7;
  border: solid 1px #ccc;
  border-bottom: none;

  ${media.smallerThanMinTablet`
    padding: 4px;
  `}
`;

export const EventMonth = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 500;
  text-transform: uppercase;
`;

export const EventDay = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 400;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.base}px;
  `}
`;

export const EventYear = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: ${({ theme }) => theme.colorMain};

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.small}px;
  `}
`;
