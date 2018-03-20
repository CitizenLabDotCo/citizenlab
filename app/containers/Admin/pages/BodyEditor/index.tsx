import * as React from 'react';

import { IPageData, pageByIdStream, updatePage } from 'services/pages';
import Grapes from 'components/admin/Grapes';
import { injectResource } from 'utils/resourceLoaders/resourceLoader';
import { browserHistory } from 'react-router';

type Props = {
  page: IPageData;
  params: any;
};

type State = {};

class BodyEditor extends React.Component<Props, State> {

  handleOnSave = (html: string) => {
    const newBody = {
      ...this.props.page.attributes.body_multiloc,
      [this.props.params.locale]: html,
    };
    updatePage(this.props.page.id, {
      body_multiloc: newBody,
    }).then(() => {
        browserHistory.push(`/admin/pages/${this.props.page.id}`);
      });
  }

  render() {
    const { page, params } = this.props;
    if (!page) return null;

    const body = page.attributes.body_multiloc[params.locale];

    return (
      <Grapes
        initialValue={body}
        onSave={this.handleOnSave}
      />
    );
  }
}

export default injectResource('page', pageByIdStream, (props) => props.params.pageId)(BodyEditor);
