import { Item } from './SortableList';

export default (prevItems: Item[], currentItems: Item[]) => {
  if (prevItems.length !== currentItems.length) return true;

  for (let i = 0; i < prevItems.length; i++) {
    if (prevItems[i].id !== currentItems[i].id) return true;
  }

  return false;
};
