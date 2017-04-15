
// denormalize takes a resource out of the store and adds the data of all its relationships to it, if that data is available in the store
// Only use this function in your selectors if you're planning on actually using most of the relationships. If not, it's probably more efficient to get the relationship data at the moment you need it.

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
