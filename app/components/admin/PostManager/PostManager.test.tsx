import React from 'react';
import { shallow } from 'enzyme';

import { getIdea } from 'services/ideas';
import { mockTopicData } from 'services/__mocks__/topics';
import { mockIdeaStatusData } from 'services/__mocks__/ideaStatuses';
import { mockProposalStatusData } from 'services/__mocks__/proposalStatuses';

// mocking dependencies
jest.mock('services/globalState');
jest.mock('services/ideas');
jest.mock('resources/GetIdeaStatuses', () => 'GetIdeaStatuses');
jest.mock('resources/GetInitiativeStatuses', () => 'GetInitiativeStatuses');
jest.mock('resources/GetIdeas', () => 'GetIdeas');
jest.mock('resources/GetInitiatives', () => 'GetInitiatives');
jest.mock('./components/ActionBar', () => 'ActionBar');
jest.mock('./components/ExportMenu', () => 'ExportMenu');
jest.mock('./components/FilterSidebar', () => 'FilterSidebar');
jest.mock('./components/PostTable', () => 'PostTable');
jest.mock('./components/InfoSidebar', () => 'InfoSidebar');
jest.mock('./components/IdeasCount', () => 'IdeasCount');
jest.mock('./components/InitiativesCount', () => 'InitiativesCount');
jest.mock(
  './components/TopLevelFilters/FeedbackToggle',
  () => 'FeedbackToggle'
);
jest.mock('./components/LazyPostPreview', () => 'LazyPostPreview');
jest.mock('components/Outlet', () => 'Outlet');

import { PostManager } from './';

describe('<PostManager />', () => {
  const ideasList = [
    { id: 'idea1', enTitle: 'Idea One' },
    { id: 'idea2', enTitle: 'Idea Two' },
    { id: 'idea3', enTitle: 'Idea Three' },
  ].map((ideaInfo) => getIdea(ideaInfo.id, ideaInfo.enTitle));

  let posts;

  beforeEach(() => {
    posts = {
      list: ideasList,
    };
    posts.onChangeTopics = jest.fn();
    posts.onChangeStatus = jest.fn();
    posts.queryParameters = jest.fn();
    posts.onChangeAssignee = jest.fn();
    posts.onChangeFeedbackFilter = jest.fn();
    posts.onResetParams = jest.fn();
  });

  it('Handles the state of the Preview', () => {
    const topics = [mockTopicData];
    const postStatuses = [mockIdeaStatusData];
    const Wrapper = shallow(
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['projects', 'statuses', 'topics']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );

    const getPreviewProps = () => Wrapper.find('LazyPostPreview').props();
    expect(getPreviewProps().postId).toBeNull;

    // pass in to the PostTable a handler that opens the preview with the id called upon,
    // in view mode
    Wrapper.find('PostTable').prop('openPreview')('postId');
    expect(getPreviewProps().postId).toEqual('postId');
    expect(getPreviewProps().mode).toEqual('view');

    // pass in to the LazyPostPreview a handler that switched the mode of the preview
    Wrapper.find('LazyPostPreview').prop('onSwitchPreviewMode')();
    expect(getPreviewProps().postId).toEqual('postId');
    expect(getPreviewProps().mode).toEqual('edit');

    // pass in to the LazyPostPreview a handler that closes the preview
    Wrapper.find('LazyPostPreview').prop('onClose')();
    expect(getPreviewProps().postId).toBeNull;

    // pass in to the actionbar a method to open the edit view of current selection of one item.
    Wrapper.instance().setState({ selection: new Set(['idea1']) });
    Wrapper.find('ActionBar').prop('handleClickEdit')();
    expect(getPreviewProps().postId).toEqual('idea1');
    expect(getPreviewProps().mode).toEqual('edit');
  });

  it('Sets globalState AdminFullWidth and back', () => {
    const topics = [mockTopicData];
    const postStatuses = [mockIdeaStatusData];

    const Wrapper = shallow(
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['projects', 'statuses', 'topics']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );
    const mockSet = Wrapper.instance().globalState.set;

    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toBeCalledWith({ enabled: true });

    Wrapper.unmount();
    expect(mockSet).toBeCalledTimes(2);
    expect(mockSet).toBeCalledWith({ enabled: false });
  });

  it('Handles the selection', () => {
    const topics = [mockTopicData];
    const postStatuses = [mockIdeaStatusData];

    const Wrapper = shallow(
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['projects', 'statuses', 'topics']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );

    const getSelection = () => Wrapper.find('PostTable').prop('selection');

    // initially set to 0, and passed in the PostTable
    expect(getSelection().size).toEqual(0);

    // passes in to the table a function to freely change the selection
    Wrapper.find('PostTable').prop('onChangeSelection')(
      new Set(['post42', 'post3'])
    );
    expect(getSelection()).toEqual(new Set(['post42', 'post3']));

    // passes to the ActionBar a function to reset the seletion
    Wrapper.find('ActionBar').prop('resetSelection')();
    expect(getSelection().size).toEqual(0);
  });

  it('Handles the active state of the filter menu', () => {
    const topics = [mockTopicData];
    const postStatuses = [mockIdeaStatusData];

    const Wrapper = shallow(
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['topics', 'statuses', 'projects']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );

    const getActiveFilter = () =>
      Wrapper.find('FilterSidebar').prop('activeFilterMenu');

    // initially sets it to the first item of the visibleFilterMenus prop
    expect(getActiveFilter()).toEqual('topics');

    // reacts to changes from the FilterSidebar component
    Wrapper.find('FilterSidebar').prop('onChangeActiveFilterMenu')('projects');
    expect(getActiveFilter()).toEqual('projects');

    Wrapper.setProps({ visibleFilterMenus: ['statuses', 'topics'] });
    expect(getActiveFilter()).toEqual('statuses');
  });

  it('Passes down the search value to posts.onChangesSearchTerm', () => {
    const onChangeSearchTerm = jest.fn();
    posts.onChangeSearchTerm = onChangeSearchTerm;
    const topics = [mockTopicData];
    const postStatuses = [mockIdeaStatusData];

    const Wrapper = shallow(
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['topics', 'statuses', 'projects']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );

    Wrapper.find('PostManager__StyledInput').prop('onChange')({
      target: { value: 'searchString' },
    });

    // initially sets it to the first item of the visibleFilterMenus prop
    expect(onChangeSearchTerm).toHaveBeenCalledWith('searchString');
  });

  it("Gets and sets the selected status from the query parameters of posts when it's handling initiatives", () => {
    posts.queryParameters = { initiative_status: 'Some Status' };
    const onChangeStatus = jest.fn();
    posts.onChangeStatus = onChangeStatus;
    const topics = [mockTopicData];
    const postStatuses = [mockProposalStatusData];

    const Wrapper = shallow(
      <PostManager
        type="Initiatives"
        visibleFilterMenus={['topics', 'statuses', 'projects']}
        posts={posts}
        postStatuses={postStatuses}
        topics={topics}
      />
    );

    const selectedStatus = Wrapper.find('FilterSidebar').prop('selectedStatus');

    // initially sets it to the first item of the visibleFilterMenus prop
    expect(selectedStatus).toBe('Some Status');

    Wrapper.find('FilterSidebar').prop('onChangeStatusFilter')(
      'Some other status'
    );
    expect(onChangeStatus).toHaveBeenCalledWith('Some other status');
  });
});
