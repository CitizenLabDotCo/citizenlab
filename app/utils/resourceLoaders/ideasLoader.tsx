import * as React from 'react';
import * as Rx from 'rxjs';
import { ideasStream, IIdeaData } from 'services/ideas';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface ExternalProps {

}

interface State {
  ideas: IIdeaData[];
  ideaSortDirection: string;
  ideaSortAttribute: string;
  ideaCurrentPageNumber: number;
  ideaLastPageNumber: number;
  ideaSearchTerm: string | null;
  ideaProjectFilter: string | null;
  ideaStatusFilter: string | null;
  ideaPhaseFilter: string | null;
  ideaTopicsFilter?: string[] | null;
  ideaAreasFilter?: string[] | null;
}

export interface InjectedIdeaLoaderProps {
  ideas?: IIdeaData[];
  ideaSortDirection?: 'asc' | 'desc';
  onChangeIdeaSortDirection?: (direction: 'asc' | 'desc') => void;
  ideaSortAttribute?: string;
  onChangeIdeaSortAttribute?: (string) => void;
  ideaCurrentPageNumber?: number;
  ideaLastPageNumber?: number;
  onIdeaChangePage?: (number) => void;
  ideaProjectFilter?: string;
  onChangeProjectFilter?: (string) => void;
  ideaStatusFilter?: string;
  onChangeStatusFilter?: (string) => void;
  ideaPhaseFilter?: string;
  onChangePhaseFilter?: (string) => void;
  ideaTopicsFilter?: string[];
  onChangeTopicsFilter?: (topics: string[]) => void;
  ideaAreasFilter?: string[];
  onChangeAreasFilter?: (areas: string[]) => void;
  onChangeSearchTerm?: (string) => void;
}

export const injectIdeasLoader = <TOriginalProps extends {}>(WrappedComponent: React.ComponentClass<TOriginalProps & InjectedIdeaLoaderProps>) => {
  type ResultProps = TOriginalProps & ExternalProps;
  return class IdeaManager extends React.Component<ResultProps, State> {

    ideasObservable: Rx.Subscription;

    constructor(props: ResultProps) {
      super(props);
      this.state = {
        ideas: [],
        ideaSortDirection: 'asc',
        ideaSortAttribute: 'new',
        ideaCurrentPageNumber: 1,
        ideaLastPageNumber: 1,
        ideaSearchTerm: '',
        ideaProjectFilter: null,
        ideaStatusFilter: null,
        ideaPhaseFilter: null,
        ideaTopicsFilter: null,
        ideaAreasFilter: null,
      };
    }

    componentDidMount() {
      this.resubscribeIdeas();
    }

    componentWillUnmount() {
      this.ideasObservable.unsubscribe();
    }

    resubscribeIdeas() {
      if (this.ideasObservable) {
        this.ideasObservable.unsubscribe();
      }

      const sortSign = this.state.ideaSortDirection === 'desc' ? '-' : '';
      const queryParams: any = {
        'page[size]': 10,
        'page[number]': this.state.ideaCurrentPageNumber,
        search: this.state.ideaSearchTerm,
        sort: `${sortSign}${this.state.ideaSortAttribute}`,
      };

      if (this.state.ideaProjectFilter) {
        queryParams.project = this.state.ideaProjectFilter;
      }

      if (this.state.ideaPhaseFilter) {
        queryParams.phase = this.state.ideaPhaseFilter;
      }

      if (this.state.ideaTopicsFilter) {
        queryParams['topics[]'] = this.state.ideaTopicsFilter;
      }

      if (this.state.ideaAreasFilter) {
        queryParams['areas[]'] = this.state.ideaAreasFilter;
      }

      if (this.state.ideaStatusFilter) {
        queryParams['idea_status'] = this.state.ideaStatusFilter;
      }

      this.ideasObservable = ideasStream({
        queryParameters: queryParams,
      }).observable.subscribe((data) => {
        const currentPageNumber = getPageNumberFromUrl(data.links.self) || 1;
        const lastPageNumber = getPageNumberFromUrl(data.links.last) || currentPageNumber;
        this.setState({
          ideas: data.data,
          ideaLastPageNumber: lastPageNumber || this.state.ideaLastPageNumber,
        });
      });
    }

    changeIdeaSortDirection = (direction: 'asc' | 'desc') => {
      this.setState({
        ideaSortDirection: direction,
      }, this.resubscribeIdeas);
    }

    changeIdeaSortAttribute = (attribute) => {
      this.setState({
        ideaSortAttribute: attribute,
      }, this.resubscribeIdeas);
    }

    changeSearchTerm = (term) => {
      this.setState({
        ideaSearchTerm: term
      }, this.resubscribeIdeas);
    }

    changeProjectFilter = (project) => {
      this.setState({
        ideaProjectFilter: project,
      }, this.resubscribeIdeas);
    }

    changeStatusFilter = (status) => {
      this.setState({
        ideaStatusFilter: status,
      }, this.resubscribeIdeas);
    }

    changePhaseFilter = (phase) => {
      this.setState({
        ideaPhaseFilter: phase,
      }, this.resubscribeIdeas);
    }

    changeTopicsFilter = (topics) => {
      this.setState({
        ideaTopicsFilter: topics,
      }, this.resubscribeIdeas);
    }

    changeAreasFilter = (areas) => {
      this.setState({
        ideaAreasFilter: areas,
      }, this.resubscribeIdeas);
    }

    changePage = (page) => {
      this.setState({
        ideaCurrentPageNumber: page,
      }, this.resubscribeIdeas);
    }


    render() {
      return (
        <WrappedComponent
          {...this.props}
          ideas={this.state.ideas}
          ideaSortDirection={this.state.ideaSortDirection}
          onChangeIdeaSortDirection={this.changeIdeaSortDirection}
          ideaSortAttribute={this.state.ideaSortAttribute}
          onChangeIdeaSortAttribute={this.changeIdeaSortAttribute}
          ideaCurrentPageNumber={this.state.ideaCurrentPageNumber}
          ideaLastPageNumber={this.state.ideaLastPageNumber}
          onIdeaChangePage={this.changePage}
          ideaProjectFilter={this.state.ideaProjectFilter}
          onChangeProjectFilter={this.changeProjectFilter}
          ideaStatusFilter={this.state.ideaStatusFilter}
          onChangeStatusFilter={this.changeStatusFilter}
          ideaPhaseFilter={this.state.ideaPhaseFilter}
          onChangePhaseFilter={this.changePhaseFilter}
          ideaTopicsFilter={this.state.ideaTopicsFilter}
          onChangeTopicsFilter={this.changeTopicsFilter}
          ideaAreasFilter={this.state.ideaAreasFilter}
          onChangeAreasFilter={this.changeAreasFilter}
          onChangeSearchTerm={this.changeSearchTerm}
        />
      );
    }

  };

};
