import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';
import { IResolution } from '..';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const ResolutionButton = styled.button`
  font-size: ${fontSizes.base}px;
  padding: 1rem 1.5rem;
  background: ${colors.adminContentBackground};
  border: solid 1px ${colors.separation};
  cursor: pointer;
  outline: none;

  &.active {
    background: ${rgba(colors.adminTextColor, .1)};
  }

  &:first-child {
    border-radius: ${(props: any) => props.theme.borderRadius} 0 0 ${(props: any) => props.theme.borderRadius};
  }

  &:last-child {
    border-radius: 0 ${(props: any) => props.theme.borderRadius} ${(props: any) => props.theme.borderRadius} 0;
    margin-right: 0;
  }

  &:hover, &:focus {
    background: ${rgba(colors.adminTextColor, .2)};
  }

  @media print {
    &.active {
      font-weight: 600;
    }
  }
`;

type Props = {
  value: IResolution;
  onChange: (arg: IResolution) => void;
};

export default class ResolutionControl extends React.PureComponent<Props> {
  change = (resolution: IResolution) => () => {
    this.props.onChange(resolution);
  }

  render() {
    const { value } = this.props;
    const resOptions: IResolution[] = ['day', 'week', 'month'];

    return (
      <Container>
        {resOptions.map(resolution =>
          <ResolutionButton
            key={resolution}
            className={`${value === resolution && 'active'}`}
            onClick={this.change(resolution)}
          >
            <FormattedMessage {...messages[`resolution${resolution}`]} />
          </ResolutionButton>
        )}
      </Container>
    );
  }
}
