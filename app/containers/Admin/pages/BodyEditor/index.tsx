import React from 'react';
import { updatePage } from 'services/pages';
import Grapes from 'components/admin/Grapes';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

interface DataProps {
  page: GetPageChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class BodyEditor extends React.Component<Props & WithRouterProps, State> {

  handleOnSave = (html: string) => {
    const { page } = this.props;

    if (!isNilOrError(page)) {
      const newBody = {
        ...page.attributes.body_multiloc,
        [this.props.params.locale]: html,
      };

      updatePage(page.id, { body_multiloc: newBody }).then(() => {
        browserHistory.push(`/admin/pages/${page.id}`);
      });
    }
  }

  render() {
    const { page, params } = this.props;
    if (isNilOrError(page)) return null;

    const body = page.attributes.body_multiloc[params.locale];

    return (
      <Grapes
        initialValue={body}
        onSave={this.handleOnSave}
      />
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetPage id={inputProps.params.pageId}>
    {page => <BodyEditor {...inputProps} page={page} />}
  </GetPage>
));
