import { createSelector } from 'reselect';

export const selectResourcesDomain = (...types) => (state) => state.getIn(['resources', ...types]);

export const selectResourcesDomainBySlug = (...types) => (state) => state.getIn(['resources', 'bySlug', ...types]);

export const makeSelectResourceById = (resource, idPropName = 'id') => createSelector(
  selectResourcesDomain(resource),
  (_, props) => props[idPropName],
  (resources, id) => resources && id && resources.get(id)
);

export const makeSelectResourceBySlug = (resource, slugPropName = 'slug') => createSelector(
  selectResourcesDomain(resource),
  selectResourcesDomainBySlug(resource),
  (_, props) => props[slugPropName],
  (resources, resourcesBySlug, slug) => {
    const id = resourcesBySlug && resourcesBySlug.get(slug);
    return resources && resources.get(id);
  }
);
