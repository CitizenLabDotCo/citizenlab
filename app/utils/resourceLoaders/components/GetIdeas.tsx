// Libs
import React from 'react';
import { Subscription } from 'rxjs';
import { omit, omitBy, isEmpty } from 'lodash';

// Services & Utils
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IIdeaData, ideasMarkersStream, ideasStream } from 'services/ideas';


// Typing
interface Props {
  markers?: boolean;
  children: {(state: State): any};
  pageSize?: number;
  currentPageNumber?: number;
  sortAttribute?: 'new' | 'trending' | 'popular' | 'author_name' | 'upvotes_count' | 'downvotes_count' | 'status';
  sortDirection?: 'asc' | 'desc';
  project?: string;
  phase?: string;
  topics?: string[];
  areas?: string[];
  searchTerm?: string;
  status?: string;
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

  componentWillMount() {
    this.updateSubscription(this.props);
  }

  componentWillReceiveProps(newProps) {
    // Compare props to avoid excessive re-subs
    const newParams = omit(newProps, 'children');
    const difference = omitBy(newParams, (value, key) => this.props[key] === value);

    if (!isEmpty(difference)) {
      this.updateSubscription(newProps);
    }
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
