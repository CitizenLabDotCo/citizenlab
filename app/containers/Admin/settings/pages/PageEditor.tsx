// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { pageBySlugStream, createPage, updatePage, IPageData, PageUpdate } from 'services/pages';

// Components
import SubmitWrapper from 'components/admin/SubmitWrapper';

// Utils
import getSubmitState from 'utils/getSubmitState';

// Typings
import { API } from 'typings';

interface Props {
  slug: string;
}

interface State {
  page: IPageData | null;
  saving: boolean;
  saved: boolean;
  errors: {
    [key: string]: API.Error[];
  } | null;
  diff: PageUpdate;
}

export default class PageEditor extends React.Component<Props, State> {
  subs: Rx.Subscription[] = [];

  constructor(props) {
    super();

    this.state = {
      page: null,
      saving: false,
      saved: false,
      diff: {},
      errors: null,
    };
  }

  getPageSub() {
    return pageBySlugStream(this.props.slug).observable
    .subscribe(response => {
      if (response) {
        this.setState({ page: response.data });
      }
    });
  }

  componentWillMount() {
    this.subs.push(
      this.getPageSub()
    );
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  handleSave = () => {
    let savePromise;

    if (this.state.page && this.state.page.id) {
      savePromise = updatePage(this.state.page.id, this.state.diff);
    } else {
      savePromise = createPage({ ...this.state.diff, slug: this.props.slug })
      .then((response) => {
        this.subs.push(this.getPageSub());
        return response;
      });
    }

    savePromise
    .then((response) => {
      this.setState({ saving: false, saved: true, errors: null });
    })
    .catch((e) => {
      this.setState({ saving: false, saved: false, errors: e.json.errors });
    });
  }

  render() {
    return (
      <div>
        {this.state.page && this.state.page.attributes.slug}
        <p>Page Editor</p>
      </div>
    );
  }
}
