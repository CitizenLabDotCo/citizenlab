import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import Author from 'components/Author';
import { lighten } from 'polished';
import CommentsMoreActions from './CommentsMoreActions';

export const OfficialHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const OfficialStyledAuthor = styled(Author)`
  margin-right: 20px;

  ${media.smallerThanMinTablet`
    align-self: flex-start;
    order: 2;
  `}
`;

export const StyledAuthor = styled(Author)`
  margin-right: 20px;

  ${media.smallerThanMinTablet`
    align-self: flex-start;
  `}
`;

export const Extra = styled.div`
  display: flex;
  align-items: center;
  padding-top: 5px;
  margin-bottom: 20px;

  ${media.smallerThanMinTablet`
    order: 1;
    width: 100%;
    justify-content: space-between;
  `}
`;

export const Badge = styled.span`
  color: ${colors.clRedError};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${lighten(.46, colors.clRed)};
  border: none;
  padding: 4px 8px;
  height: 24px;
  margin-right: 5px;
  display: flex;
  align-items: center;
`;

export const StyledMoreActionsMenu = styled(CommentsMoreActions)`
  ${media.smallerThanMinTablet`
    margin-left: auto;
  `}
`;

export const TranslateButton = styled.button`
  padding: 0;
  color: ${colors.clBlue};
  text-decoration: underline;
  margin-top: 10px;

  &:hover {
    cursor: pointer;
  }
`;
