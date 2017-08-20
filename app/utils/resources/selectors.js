import { createSelector } from 'reselect';
import _ from 'lodash';

export const selectResourcesDomain = (...types) => (state) => state.getIn(['resources', ...types]);

export const selectResourcesDomainBySlug = (...types) => (state) => state.getIn(['resources', 'bySlug', ...types]);

export const makeSelectResourceById = (resource, idPropName = 'id') => createSelector(
  selectResourcesDomain(resource),
  (__, props) => _.isFunction(idPropName) ? idPropName(props) : props[idPropName],
  (resources, id) => resources && id && resources.get(id)
);

export const makeSelectResourceBySlug = (resource, slugPropName = 'slug') => createSelector(
  selectResourcesDomain(resource),
  selectResourcesDomainBySlug(resource),
  (__, props) => _.isFunction(slugPropName) ? slugPropName(props) : props[slugPropName],
  (resources, resourcesBySlug, slug) => {
    const id = resourcesBySlug && resourcesBySlug.get(slug);
    return resources && resources.get(id);
  }
);
