import React from 'react';

import {
  Box,
  Radio,
  Icon,
  Label,
  colors,
  media,
} from '@citizenlab/cl2-component-library';
import { useNode, Element } from '@craftjs/core';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import { ColumnLayout } from '../../typings';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import Container from '../Container';

import messages from './messages';

type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
};

export const TwoColumnWrapper = styled(Box)`
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

export const TwoColumn = ({ columnLayout, children }: TwoColumnProps) => {
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <TwoColumnWrapper
      className="e2e-two-column"
      columnLayout={columnLayout}
      px={componentDefaultPadding}
      maxWidth="1200px"
      margin="0 auto"
    >
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </TwoColumnWrapper>
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
      <Label>
        <FormattedMessage {...messages.columnLayoutRadioLabel} />
      </Label>
      <Radio
        onChange={(value) => {
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
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
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
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
          setProp((props: TwoColumnProps) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
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

const twoColumnCraftConfig = {
  props: {
    columnLayout: '',
  },
  related: {
    settings: TwoColumnSettings,
  },
  custom: {
    title: messages.twoColumn,
    hasChildren: true,
  },
};

TwoColumn.craft = twoColumnCraftConfig;

export const twoColumnTitle = messages.twoColumn;

export default TwoColumn;
