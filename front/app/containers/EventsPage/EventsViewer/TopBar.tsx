import React, { memo } from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import { Icon } from 'cl2-component-library';

// styling
import styled, { useTheme } from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: solid 1px #ccc;
  margin-bottom: 29px;
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
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
`;

const FilterIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.colorText};
  margin-right: 3px;
`;

interface Props {
  title: string;
  setProjectIds: (projectIds: string[]) => void;
}

const TopBar = memo<Props & InjectedIntlProps>(
  ({ title, setProjectIds, intl }) => {
    const theme: any = useTheme();

    return (
      <Container>
        <Title>{title}</Title>

        <ProjectFilterDropdownPositioner>
          <FilterIcon name="filter-funnel" />
          <ProjectFilterDropdown
            title={intl.formatMessage(messages.filterDropdownTitle)}
            onChange={setProjectIds}
            textColor={theme.colorText}
          />
        </ProjectFilterDropdownPositioner>
      </Container>
    );
  }
);

export default injectIntl(TopBar);
