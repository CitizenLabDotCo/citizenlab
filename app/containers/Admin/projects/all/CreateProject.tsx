import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import { HeaderTitle } from './styles';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { fontSizes, colors, media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div``;

const CreateProjectButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 35px;
  padding-bottom: 35px;
  margin: 0;
  cursor: pointer;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.separation};

  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  &:hover,
  &:focus {
    border-color: ${colors.clIconAccent};
  }

  ${media.smallerThan1280px`
    padding-left: 2rem;
    padding-right: 2rem;
  `}
`;

const CreateProjectContent = styled.div`
  width: 100%;
  height: 400px;
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border: 1px solid ${(props) => props.theme.colors.separation};
  border-top: none;
`;

const Expand = styled.div`
  display: flex;
  align-items: center;
`;

const ExpandText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-right: 10px;
`;

const ExpandIconWrapper = styled.div`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${colors.separation};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExpandIcon = styled(Icon)`
  height: 10px;
  fill: ${colors.label};
`;

interface Props {
  className?: string;
}

const CreateProject = memo<Props>(({ className }) => {
  return (
    <Container className={className}>
      <CreateProjectButton>
        <HeaderTitle>
          <FormattedMessage {...messages.createAProject} />
        </HeaderTitle>
        <Expand>
          <ExpandText>
            <FormattedMessage {...messages.expand} />
          </ExpandText>
          <ExpandIconWrapper>
            <ExpandIcon name="chevron-right" />
          </ExpandIconWrapper>
        </Expand>
      </CreateProjectButton>
      <CreateProjectContent>
        Bleh
      </CreateProjectContent>
    </Container>
  );
});

export default CreateProject;
