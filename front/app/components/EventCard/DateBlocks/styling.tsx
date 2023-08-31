import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';

export const EventDateBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const EventDateBlockLabel = styled.div`
  color: ${colors.textSecondary};
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
  border-radius: ${(props) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #f5f6f7;
  border: solid 1px #ccc;
  border-bottom: none;
  color: ${(props) => props.theme.colors.tenantText};

  ${media.phone`
    padding: 4px;
  `}
`;

export const EventMonth = styled.div`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 500;
  text-transform: uppercase;
`;

export const EventDay = styled.div`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;

  ${media.phone`
    font-size: ${fontSizes.s}px;
  `}
`;

export const EventYear = styled.div`
  color: #fff;
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: ${(props) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: ${({ theme }) => theme.colors.tenantPrimary};

  ${media.phone`
    font-size: ${fontSizes.s}px;
  `}
`;
