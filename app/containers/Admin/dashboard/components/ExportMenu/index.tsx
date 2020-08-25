// libraries
import React, { useState } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import { Dropdown } from 'cl2-component-library';

const DropdownButton = styled(Button)``;

const Container = styled.div`
  display: flex;
  align-items: end;
  position: relative;
  cursor: pointer;
`;

interface ExportMenuProps {
  exporting: boolean;
  className?: string;
  // handleDownloadSvg: (name: string, ref: any) => void;
  handleDownloadXls: () => void;
  svgNode: Node;
}

const ExportMenu: React.SFC<ExportMenuProps> = (props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  // const [exportingXls, setExportingXls] = useState(false);

  const handleDownloadSvg = (name: string) => {
    console.log(props.svgNode);
    let svgContent = new XMLSerializer().serializeToString(props.svgNode);
    let svgBlob = new Blob([svgContent], {
      type: 'image/svg+xml;charset=utf-8',
    });

    // const {
    //   startAtMoment,
    //   endAtMoment,
    //   currentGroupFilterLabel,
    //   currentTopicFilterLabel,
    //   currentProjectFilterLabel,
    // } = this.state;

    // const startAt = startAtMoment && startAtMoment.toISOString().split('T')[0];
    // const endAt = endAtMoment && endAtMoment.toISOString().split('T')[0];

    // const fileName = `${name}${startAt ? '_from-' + startAt : ''}${
    //   endAt ? '_until-' + endAt : ''
    // }${
    //   currentProjectFilterLabel ? '_project-' + currentProjectFilterLabel : ''
    // }${currentGroupFilterLabel ? '_group-' + currentGroupFilterLabel : ''}${
    //   currentTopicFilterLabel ? '_topic-' + currentTopicFilterLabel : ''
    // }.svg`;

    saveAs(svgBlob, name + 'svg');
  };

  return (
    <Container className={props.className}>
      <DropdownButton
        buttonStyle="admin-dark-text"
        onClick={() => setDropdownOpened(!dropdownOpened)}
        icon="download"
        iconPos="right"
        padding="0px"
      />
      <Dropdown
        width="100%"
        top="35px"
        right="-5px"
        mobileRight="-5px"
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(!dropdownOpened)}
        content={
          <>
            <Button
              onClick={() => handleDownloadSvg('test')}
              buttonStyle="text"
              padding="0"
              fontSize={`${fontSizes.small}px`}
            >
              Download svg
            </Button>
            <Button
              onClick={props.handleDownloadXls}
              buttonStyle="text"
              processing={props.exporting}
              padding="0"
              fontSize={`${fontSizes.small}px`}
            >
              Download xls
            </Button>
          </>
        }
      />
    </Container>
  );
};

export default ExportMenu;
