import { SerializedNodes } from '@craftjs/core';
import { isEmpty, isEqual, isUndefined, omitBy } from 'lodash-es';

const areCraftjsObjectsEqual = (
  craftjsCurrentData: SerializedNodes,
  persistedData: SerializedNodes
) => {
  if (
    isEmpty(persistedData) &&
    (isEmpty(craftjsCurrentData) ||
      craftjsCurrentData['ROOT'].nodes.length === 0)
  ) {
    return true;
  }

  // When the layout is saved, `undefined` fields are not saved
  // (e.g., `parent` in { ROOT: { parent: undefined, ...}, ...} will be omitted).
  // So, they are never present in reportLayout.attributes.craftjs_json,
  // but they are present in the editor state `query.getSerializedNodes()`.
  //
  // The "for" loop does the same thing as this alternative version with JSON.stringify,
  // but it's more performant.
  //
  // JSON.stringify emulates sending the data to the server and getting it back
  // (it removes undefined values).
  // JSON.parse makes sure that the comparison is not affected by the order of keys.
  // return isEqual(
  //   JSON.parse(JSON.stringify(craftjsCurrentData)),
  //   JSON.parse(JSON.stringify(persistedData))
  // );
  //
  // If persistedData has a key (a node) that craftjsCurrentData doesn't have,
  // it will still work correctly because
  // persistedData['ROOT'].nodes will have it, and craftjsCurrentData['ROOT'].nodes won't.
  for (const key in craftjsCurrentData) {
    if (
      !isEqual(
        omitBy(craftjsCurrentData[key], isUndefined),
        omitBy(persistedData[key], isUndefined)
      )
    ) {
      return false;
    }
  }
  return true;
};

export default areCraftjsObjectsEqual;
