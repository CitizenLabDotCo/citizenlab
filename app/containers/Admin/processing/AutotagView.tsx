import { Button } from 'cl2-component-library';
import React, { ReactElement } from 'react';

// styling
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
`;

interface Props {
  closeView: () => void;
}

// const Processing = memo<Props & InjectedIntlProps>(
//   ({ className, ideas, projects }) => {
//     const localize = useLocalize();
//     const tenant = useTenant();
//     const locale = useLocale();

const AutotagView = ({ closeView }: Props) => {
  return (
    <Container>
      Hello World
      <Button onClick={closeView} icon={'close'} locale={'en'} />
    </Container>
  );
};

export default AutotagView;
