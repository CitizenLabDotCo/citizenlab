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

type TwoColumnProps = {
  columnLayout: string;
  children: React.ReactNode;
};

const StyledBox = styled(Box)`
  min-height: 40px;
  width: 100%;
  gap: 24px;
  display: grid;

  ${media.tablet`
    grid-template-columns: 1fr;
  `}

  grid-template-columns: ${(props: TwoColumnProps) =>
    props.columnLayout === '1-1'
      ? '1fr 1fr'
      : props.columnLayout === '2-1'
      ? '2fr 1fr'
      : '1fr 2fr'};
`;

export const TwoColumn: UserComponent = ({
  columnLayout,
  children,
}: TwoColumnProps) => {
  return (
    <StyledBox id="e2e-two-column" columnLayout={columnLayout}>
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </StyledBox>
  );
};

const TwoColumnSettings = () => {
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
            fill={colors.primary}
            name="layout-2column-1"
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
            fill={colors.primary}
            name="layout-2column-3"
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
            fill={colors.primary}
            name="layout-2column-2"
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

export default TwoColumn;
