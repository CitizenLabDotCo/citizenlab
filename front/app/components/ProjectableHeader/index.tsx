import { PROJECTABLE_HEADER_BG_ASPECT_RATIO } from 'api/projects/constants';
import Image from 'components/UI/Image';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export const HeaderImageContainer = styled.div`
  width: 100%;
  aspect-ratio: ${PROJECTABLE_HEADER_BG_ASPECT_RATIO} / 1; // This line is not required because image is cropped to this ratio anyway; just for the reference.
  margin-bottom: 30px;
  border-radius: ${(props) => props.theme.borderRadius};
  overflow: hidden;
  position: relative; // It's used to display elements inside (e.g. share button for folders).

  ${media.phone`
    aspect-ratio: ${PROJECTABLE_HEADER_BG_ASPECT_RATIO - 1} / 1;
    margin-bottom: 20px;
  `}
`;

export const HeaderImage = styled(Image)`
  width: 100%;
  height: 100%;
`;
