import React, { memo } from 'react';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

// svg
import filterIcon from './FilterIcon.svg';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: solid 1px #ccc;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl};
  `}
`;

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
`;

const FilterIcon = styled.img`
  transform: translate(0, -1.5px);
`;

interface Props {
  title: JSX.Element;
}

const TopBar = memo<Props>(({ title }) => {
  return (
    <Container>
      <Title>{title}</Title>

      <ProjectFilterDropdownPositioner>
        <FilterIcon src={filterIcon} />
        <ProjectFilterDropdown title="Projects" onChange={console.log} />
      </ProjectFilterDropdownPositioner>
    </Container>
  );
});

export default TopBar;
