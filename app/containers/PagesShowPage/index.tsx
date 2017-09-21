/*
 *
 * PagesShowPage
 *
 */

import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import HelmetIntl from 'components/HelmetIntl';
import T from 'containers/T';
import { IPageData, pageBySlugStream } from 'services/pages';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';

type Props = {
  params: {
    slug: string;
  }
}

type State = {
  page: IPageData | null,
}
class PagesShowPage extends React.PureComponent<Props, State> { // eslint-disable-line react/prefer-stateless-function
  pageObserver: Rx.Subscription | null;

  constructor() {
    super();
    this.pageObserver = null;
    this.state = {
      page: null,
    };
  }

  componentDidMount() {
    this.pageObserver = pageBySlugStream(this.props.params.slug).observable.subscribe((response) => {
      this.setState({
        page: response.data,
      });
    });
  }

  render() {
    const { page } = this.state;
    return (
      <ContentContainer>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {page && <div>
          <div>
            <h1><T value={page.attributes.title_multiloc} /></h1>
            <T value={page.attributes.body_multiloc} />
          </div>
        </div>}
      </ContentContainer>
    );
  }
}

export default PagesShowPage;
