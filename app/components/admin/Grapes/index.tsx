import * as React from 'react';
import styled from 'styled-components';
import * as grapesjs from 'grapesjs/dist/grapes.min.js';
import 'grapesjs/dist/css/grapes.min.css';
import loadBasicBlocks from './basic_blocks';

import Button from 'components/UI/Button';


const ButtonWrapper = styled.div`
  margin: 2rem 0;
`;


type Props = {
  initialValue: string;
  onSave: (html: string) => void;
};

type State = {
};

class Grapes extends React.Component<Props, State> {
  editor: any = null;
  ref: any = null;

  componentDidMount() {
    this.editor = grapesjs.init({
      container: `#${this.ref.id}`,
      style: '.txt-red{color: red}',
    });
    this.editor.setComponents(this.props.initialValue);
    this.setupBlocks();
  }

  setupBlocks = () => {
    const blockManager = this.editor.BlockManager;

    blockManager.add('title', {
      label: 'title',
      category: 'Basic',
      attributes: { class: 'fa fa-header' },
      content: '<h1>Title</h1>',
    });

    blockManager.add('subtitle', {
      label: 'subtitle',
      category: 'Basic',
      attributes: { class: 'fa fa-header' },
      content: '<h2>Sub Title</h2>',
    });

    loadBasicBlocks(this.editor);
  }

  setRef = (ref) => {
    this.ref = ref;
  }

  handleOnSave = () => {
    const editor = this.editor;
    const html = editor.getHtml();
    const css = editor.getCss();
    this.props.onSave(`<style>${css}</style>${html}`);
  }

  render() {
    return (
      <>
        <div id="grapes-editor" ref={this.setRef} />
        <ButtonWrapper>
          <Button onClick={this.handleOnSave}>Save</Button>
        </ButtonWrapper>
      </>
    );
  }

}

export default Grapes;
