import React, { PureComponent, ReactNode } from 'react';
import { Range, getTrackBackground } from 'react-range';
import styled from 'styled-components';
import { colors, defaultOutline } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  & .thumb {
    &:not(.dragged):hover {
      border-color: #333 !important;
    }

    &.dragged {
      border-color: #333 !important;
      background: linear-gradient(180deg, #e0e0e0 40%, #fff 100%) !important;
    }

    &:focus {
      outline: none;
    }

    &.focus-visible {
      ${defaultOutline};
    }
  }
`;

interface Props {
  step: number;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

interface State {}

interface IThumbProps {
  key: number;
  style: React.CSSProperties;
  tabIndex?: number;
  'aria-valuemax': number;
  'aria-valuemin': number;
  'aria-valuenow': number;
  draggable: boolean;
  role: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
}

interface ITrackProps {
  style: React.CSSProperties;
  ref: React.RefObject<any>;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

class RangeInput extends PureComponent<Props, State> {
  handleOnChange = (values: number[]) => {
    this.props.onChange(values[0]);
  };

  render() {
    const track = ({
      props,
      children,
    }: {
      props: ITrackProps;
      children: ReactNode;
    }) => (
      <div
        role="button"
        onMouseDown={props.onMouseDown}
        onTouchStart={props.onTouchStart}
        style={{
          ...props.style,
          height: '36px',
          display: 'flex',
          width: '100%',
        }}
      >
        <div
          ref={props.ref}
          style={{
            height: '2px',
            width: '100%',
            borderRadius: '4px',
            background: getTrackBackground({
              values: [this.props.value],
              colors: [colors.label, '#e0e0e0'],
              min: this.props.min,
              max: this.props.max,
            }),
            alignSelf: 'center',
          }}
        >
          {children}
        </div>
      </div>
    );

    const thumb = ({
      props,
      isDragged,
    }: {
      props: IThumbProps;
      isDragged: boolean;
    }) => (
      <div
        {...props}
        style={{
          ...props.style,
          height: '25px',
          width: '25px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          border: 'solid 1px #999',
          background: 'linear-gradient(180deg, #fff 40%, #e0e0e0 100%)',
        }}
        className={`thumb ${isDragged ? 'dragged' : ''}`}
      >
        <div
          style={{
            position: 'absolute',
            top: '-32px',
            color: '#fff',
            fontWeight: 400,
            fontSize: '14px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#333',
            display: isDragged ? 'block' : 'none',
          }}
        >
          {this.props.value.toFixed(0)}
        </div>
      </div>
    );

    return (
      <Container className={this.props.className || ''}>
        <Range
          values={[this.props.value]}
          step={this.props.step}
          min={this.props.min}
          max={this.props.max}
          onChange={this.handleOnChange}
          renderTrack={track}
          renderThumb={thumb}
        />
      </Container>
    );
  }
}

export default RangeInput;
