import React from 'react';

// components
import { Box, Radio, Title, Icon } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';

// utils
import { colors, media } from 'utils/styleUtils';

// craft
import { useNode, UserComponent, Element } from '@craftjs/core';
import Container from '../Container';

// Intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

const StyledBox = styled(Box)`
  min-height: 40px;
  width: 100%;
  gap: 16px;
  display: grid;

  ${media.smallerThanMaxTablet`
    grid-template-columns: 1fr;
  `}

  ${media.biggerThanMaxTablet`
  &.LayoutEven {
    grid-template-columns: 1fr 1fr;
  }

  &.LayoutOneTwo {
    grid-template-columns: 1fr 2fr;
  }

  &.LayoutTwoOne {
    grid-template-columns: 2fr 1fr;
  }
  `}
`;

export const TwoColumn: UserComponent = ({
  columnLayout,
  children,
}: {
  columnLayout: '1-1' | '2-1' | '1-2';
  children?: React.ReactNode;
}) => {
  return (
    <StyledBox
      id="e2e-two-column"
      className={
        columnLayout === '1-1'
          ? 'LayoutEven'
          : columnLayout === '1-2'
          ? 'LayoutOneTwo'
          : 'LayoutTwoOne'
      }
    >
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </StyledBox>
  );
};

export const TwoColumnSettings = () => {
  const {
    actions: { setProp },
    columnLayout,
  } = useNode((node) => ({
    columnLayout: node.data.props.columnLayout,
  }));

  return (
    <Box mb="30px">
      <Title variant="h4" as="h3">
        <FormattedMessage {...messages.columnLayoutRadioLabel} />
      </Title>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        id="layout-1-1"
        name="columnLayout"
        value={'1-1'}
        label={
          <Icon
            title={<FormattedMessage {...messages.twoEvenColumn} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2"
          />
        }
        isRequired
        currentValue={columnLayout}
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-2-1"
        name="columnLayout"
        value="2-1"
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant2and1} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2Variant2-1"
          />
        }
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-1-2"
        name="columnLayout"
        value="1-2"
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant1and2} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2Variant1-2"
          />
        }
        isRequired
      />
    </Box>
  );
};

TwoColumn.craft = {
  props: {
    columnLayout: '',
  },
  related: {
    settings: TwoColumnSettings,
  },
};
