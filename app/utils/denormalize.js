// denormalize takes a resource out of the store and adds the data of all its relationships to it, if that data is available in the store
// Only use this function in your selectors if you're planning on actually using most of the relationships. If not, it's probably more efficient to get the relationship data at the moment you need it.

const { OrderedMap } = require('immutable')


export default function denormalize(resources, type, id) {
  let resource = resources.getIn([type, id]);
  resource.get('relationships').forEach((ships, relation) => {
    const data = ships.get('data');
    if (data.constructor.name === 'List') {
      data.forEach((ship, i) => {
        const shipId = ship.get('id');
        const shipType = ship.get('type');
        const linkedResource = resources.getIn([shipType, shipId]);
        resource = resource.updateIn(['relationships', relation, 'data'], (innerData) => (
          innerData.set(i, linkedResource)
        ));
      });
    } else if (data.constructor.name === 'Map') {
      const ship = data;
      const shipId = ship.get('id');
      const shipType = ship.get('type');
      const linkedResource = resources.getIn([shipType, shipId]);
      resource = resource.setIn(['relationships', relation], linkedResource);
    }
  });
  return resource;
}

export function activeList(ids, ideas) {
  let newMap = OrderedMap();
  ids.forEach((id, i) => {
    const newIdea = ideas.get(id);
    newMap = newMap.set(id, newIdea);
  });
  return newMap;
}

const getLinedResources = function (item, resource) {
  if (!resource) return item;
  const id = item.get('id');
  return item.setIn(['data'], resource[1].getIn([id, 'attributes']));
};


export function activeResource(ideas, resources) {
  return ideas.map((idea) => {
    const NewRelations = idea.get('relationships').map((relation, key) => {
      if (!resources[key]) return relation;
      const data = relation.get('data');
      const constructorType = data.constructor.name;
      let linkedResource;
      if (constructorType === 'List') {
        linkedResource = data.map((item) => getLinedResources(item, resources[key]));
      } else {
        linkedResource = getLinedResources(data, resources[key]);
      }
      return relation.set('data', linkedResource);
    });
    return idea.set('relationships', NewRelations);
  });
}
