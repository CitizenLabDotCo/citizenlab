import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ProjectAndFolderCards from '.';

const mockAdminPublications = [];

let mockHasMore = false;
let mockLoadingInitial = true;
let mockLoadingMore = false;
const mockLoadMore = jest.fn();
const mockChangeAreas = jest.fn();
const mockChangePublicationStatus = jest.fn();

jest.mock('hooks/useAdminPublications', () =>
  jest.fn(() => ({
    list: mockAdminPublications,
    hasMore: mockHasMore,
    loadingInitial: mockLoadingInitial,
    loadingMore: mockLoadingMore,
    onLoadMore: mockLoadMore,
    onChangeAreas: mockChangeAreas,
    onChangePublicationStatus: mockChangePublicationStatus,
  }))
);

const mockStatusCounts = {};

const mockChangeAreas2 = jest.fn();
const mockChangePublicationStatus2 = jest.fn();

jest.mock('hooks/useAdminPublicationsStatusCounts', () => {
  jest.fn(() => ({
    counts: mockStatusCounts,
    onChangeAreas: mockChangeAreas2,
    onChangePublicationStatus: mockChangePublicationStatus2,
  }));
});

describe('<ProjectAndFolderCards />', () => {});
