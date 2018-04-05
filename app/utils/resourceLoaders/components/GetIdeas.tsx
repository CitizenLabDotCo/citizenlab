import React from 'react';
import { Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IIdeaData, ideasMarkersStream, ideasStream } from 'services/ideas';

export interface SearchQueryProps {
  areas?: string[];
  currentPageNumber?: number;
  pageSize?: number;
  phase?: string;
  project?: string;
  searchTerm?: string;
  sortAttribute?: 'new' | 'trending' | 'popular' | 'author_name' | 'upvotes_count' | 'downvotes_count' | 'status';
  sortDirection?: 'asc' | 'desc';
  status?: string;
  topics?: string[];
}

interface Props extends SearchQueryProps {
  markers?: boolean;
  children: {(state: State): any};
}

interface State {
  ideaMarkers: Partial<IIdeaData>[];
  lastPageNumber: number;
}

export default class GetIdeas extends React.PureComponent<Props, State> {
  private ideaMarkersSub: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaMarkers: [],
      lastPageNumber: 0,
    };
  }

  componentDidMount() {
    this.updateSubscription(this.props);
  }

  componentDidUpdate(prevProps: Props) {
    const { children: prevPropsChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: newPropsChildren, ...newPropsWithoutChildren } = this.props;

    if (!isEqual(newPropsWithoutChildren, prevPropsWithoutChildren)) {
      this.updateSubscription(this.props);
    }
  }

  componentWillUnmount() {
    this.ideaMarkersSub.unsubscribe;
  }

  updateSubscription(props: Props) {
    if (this.ideaMarkersSub) this.ideaMarkersSub.unsubscribe();

    // Allows to query only the markers (faster operation for map display)
    const targetStream = props.markers ? ideasMarkersStream : ideasStream;

    const sortSign = props.sortDirection === 'desc' ? '-' : '';
    const queryParameters: any = {
      'page[size]': props.pageSize || 100,
      'page[number]': props.currentPageNumber,
      search: props.searchTerm,
      sort: `${sortSign}${props.sortAttribute || 'trending'}`,
    };

    ['phase', 'project'].forEach((key) => {
      if (props[key]) queryParameters[key] = props[key];
    });

    if (props.topics) {
      queryParameters['topics[]'] = props.topics;
    }

    if (props.areas) {
      queryParameters['areas[]'] = props.areas;
    }

    if (props.status) {
      queryParameters['idea_status'] = props.status;
    }

    this.ideaMarkersSub = targetStream({
      queryParameters,
      cacheStream: false,
    }).observable
    .subscribe((data) => {
      if (data) {
        const currentPageNumber = getPageNumberFromUrl(data.links.self) || 1;
        const lastPageNumber = getPageNumberFromUrl(data.links.last) || currentPageNumber;

        this.setState({
          lastPageNumber,
          ideaMarkers: data.data,
        });
      }
    });
  }

  render() {
    return this.props.children(this.state);
  }
}
