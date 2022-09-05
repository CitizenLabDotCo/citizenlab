import { Item } from './SortableList';

export const itemOrderWasUpdated = (
  prevItems: Item[],
  currentItems: Item[]
) => {
  if (prevItems.length !== currentItems.length) return true;

  for (let i = 0; i < prevItems.length; i++) {
    if (prevItems[i].id !== currentItems[i].id) return true;
  }

  return false;
};

// export const orderingIsValid = (items: Item[]) => {
//   for (let i = 0; i < items.length; i++) {
//     const item = items[i];
//     if (item.attributes.ordering !== i) {
//       return false;
//     }
//   }

//   return true;
// };
