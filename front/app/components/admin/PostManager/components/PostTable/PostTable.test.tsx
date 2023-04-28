// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';

import { getIdea } from 'api/ideas/__mocks__/useIdeaById';

// mocking dependencies
jest.mock('./Row', () => 'Row');
jest.mock('./NoPost', () => 'NoPost');
jest.mock('./header/IdeaHeaderRow', () => 'IdeaHeaderRow');
jest.mock('./header/InitiativesHeaderRow', () => 'InitiativesHeaderRow');
jest.mock('components/admin/Pagination', () => 'Pagination');

import PostTable from './';

function makeStatus(id: string) {
  return {
    id,
    type: 'idea_status',
    attributes: {
      title_multiloc: { en: 'Just a status' },
      color: 'blue',
      code: id,
      ordering: 0,
      description_multiloc: { en: 'The status of an idea that has a status' },
    },
  };
}

describe('<PostTable />', () => {
  let onChangeSort: jest.Mock;
  let handleChangeSelection: jest.Mock;
  let onChangePage: jest.Mock;
  let openPreview: jest.Mock;
  let onResetParams: jest.Mock;
  let ideasList;
  let ideaStatusList;

  beforeEach(() => {
    onResetParams = jest.fn();
    openPreview = jest.fn();
    onChangePage = jest.fn();
    handleChangeSelection = jest.fn();
    onChangeSort = jest.fn();
    ideasList = [
      { id: 'idea1', enTitle: 'Idea One' },
      { id: 'idea2', enTitle: 'Idea Two' },
      { id: 'idea3', enTitle: 'Idea Three' },
    ].map((ideaInfo) => getIdea(ideaInfo.id, ideaInfo.enTitle));
    ideaStatusList = ['one', 'two', 'tree'].map((id) => makeStatus(id));
  });

  it('Prints the right header row', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={ideasList}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set()}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );
    expect(Wrapper.find('IdeaHeaderRow').exists()).toBe(true);
    Wrapper.setProps({ type: 'ProjectIdeas' });
    expect(Wrapper.find('IdeaHeaderRow').exists()).toBe(true);
    Wrapper.setProps({ type: 'Initiatives' });
    expect(Wrapper.find('InitiativesHeaderRow').exists()).toBe(true);
  });

  it('Prints NoPost when the list of posts is undefined', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={undefined}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set()}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );
    expect(Wrapper.find('Row').exists()).toBe(false);
    expect(Wrapper.find('Pagination').exists()).toBe(false);
    expect(Wrapper.find('NoPost').exists()).toBe(true);
  });
  it('Prints NoPost when the list of posts is an empty list', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={[]}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set()}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );
    expect(Wrapper.find('Row').exists()).toBe(false);
    expect(Wrapper.find('Pagination').exists()).toBe(false);
    expect(Wrapper.find('NoPost').exists()).toBe(true);
  });

  it('Detects when all posts are selected or not', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={ideasList}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set()}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );

    const getAllSelected = () =>
      Wrapper.find('IdeaHeaderRow').prop('allSelected');

    expect(getAllSelected).toBeFalsy;

    Wrapper.setProps({ selection: new Set(ideasList) });
    expect(getAllSelected).toBeTruthy;

    ideasList.push(getIdea('one more', 'one more'));
    Wrapper.setProps({ selection: new Set(ideasList) });
    expect(getAllSelected).toBeTruthy;

    const selection = new Set(ideasList);
    selection.delete(getIdea('idea1', 'Idea One'));
    Wrapper.setProps({ selection: new Set(ideasList) });
    expect(getAllSelected).toBeFalsy;
  });

  it('Handles selecting and unselecting one post', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={ideasList}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set(['idea3'])}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );

    const Idea2Row = Wrapper.find('Row').findWhere(
      (node) => node.prop('post').id === 'idea2'
    );
    const Idea3Row = Wrapper.find('Row').findWhere(
      (node) => node.prop('post').id === 'idea3'
    );
    let expectedSelection;

    // single select...
    expectedSelection = new Set(['idea2']);
    Idea2Row.prop('onSingleSelect')();
    expect(handleChangeSelection).toHaveBeenCalledTimes(1);
    expect(handleChangeSelection).toHaveBeenNthCalledWith(1, expectedSelection);
    Wrapper.setProps({ selection: expectedSelection });

    expectedSelection = new Set(['idea2']);
    Idea2Row.prop('onSingleSelect')();
    expect(handleChangeSelection).toHaveBeenCalledTimes(2);
    expect(handleChangeSelection).toHaveBeenNthCalledWith(2, expectedSelection);
    Wrapper.setProps({ selection: expectedSelection });

    // Toggling...
    // on
    expectedSelection = new Set(['idea2', 'idea3']);
    Idea3Row.prop('onToggleSelect')();
    expect(handleChangeSelection).toHaveBeenCalledTimes(3);
    expect(handleChangeSelection).toHaveBeenNthCalledWith(3, expectedSelection);
    Wrapper.setProps({ selection: expectedSelection });
    // and off
    expectedSelection = new Set(['idea2']);
    Idea3Row.prop('onToggleSelect')();
    expect(handleChangeSelection).toHaveBeenCalledTimes(4);
    expect(handleChangeSelection).toHaveBeenNthCalledWith(4, expectedSelection);
    Wrapper.setProps({ selection: expectedSelection });
  });

  it('Handles toggling select all', () => {
    const Wrapper = shallow(
      <PostTable
        type="AllIdeas"
        activeFilterMenu="topics"
        sortAttribute="new"
        sortDirection="ascending"
        onChangeSort={onChangeSort}
        posts={ideasList}
        phases={undefined}
        statuses={ideaStatusList}
        selection={new Set(['idea1'])}
        onChangeSelection={handleChangeSelection}
        currentPageNumber={1}
        lastPageNumber={3}
        onChangePage={onChangePage}
        handleSeeAll={onResetParams}
        openPreview={openPreview}
      />
    );

    const toggleSelectAll =
      Wrapper.find('IdeaHeaderRow').prop('toggleSelectAll');

    expect(Wrapper.find('IdeaHeaderRow').prop('allSelected')).toBe(false);

    // selects all when called on a non-full selection
    const expectedSelection = new Set(ideasList.map((idea) => idea.id));
    toggleSelectAll();
    expect(handleChangeSelection).toHaveBeenCalledTimes(1);
    expect(handleChangeSelection).toHaveBeenCalledWith(expectedSelection);
    Wrapper.setProps({ selection: expectedSelection });

    // unselects all when called on a full selection
    toggleSelectAll();
    expect(handleChangeSelection).toHaveBeenCalledTimes(2);
    expect(handleChangeSelection).toHaveBeenNthCalledWith(2, new Set());
  });
});
