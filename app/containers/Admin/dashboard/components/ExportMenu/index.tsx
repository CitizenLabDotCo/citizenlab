// libraries
import React, { useState } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import { Dropdown } from 'cl2-component-library';
import ReactDOM from 'react-dom';

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
  svgNode: React.RefObject<any>;
}

const ExportMenu: React.SFC<ExportMenuProps> = ({
  svgNode,
  className,
  exporting,
  handleDownloadXls,
}) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  // const [exportingXls, setExportingXls] = useState(false);

  const handleDownloadSvg = (name: string) => () => {
    const node = ReactDOM.findDOMNode(svgNode.current);
    if (node) {
      const svgContent = new XMLSerializer().serializeToString(node);
      const svgBlob = new Blob([svgContent], {
        type: 'image/svg+xml;charset=utf-8',
      });

      saveAs(svgBlob, name + 'svg');
    }

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
  };

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };
  console.log(svgNode);

  return (
    <Container className={className}>
      <DropdownButton
        buttonStyle="admin-dark-text"
        onClick={toggleDropdown}
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
        onClickOutside={toggleDropdown}
        content={
          <>
            <Button
              onClick={handleDownloadSvg('name')}
              buttonStyle="text"
              padding="0"
              fontSize={`${fontSizes.small}px`}
            >
              Download svg
            </Button>
            <Button
              onClick={handleDownloadXls}
              buttonStyle="text"
              processing={exporting}
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
