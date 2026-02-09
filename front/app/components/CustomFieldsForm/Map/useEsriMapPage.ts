import { useEffect, useMemo, useCallback, useRef } from 'react';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';
import { parseLayers } from 'components/EsriMap/utils';

import eventEmitter from 'utils/eventEmitter';

const useEsriMapPage = ({ project, pages, currentPageIndex, localize }) => {
  const draggableDivRef = useRef<HTMLDivElement>(null);
  const dragDividerRef = useRef<HTMLDivElement>(null);
  const { data: projectMapConfig, isFetching: isFetchingProjectConfig } =
    useProjectMapConfig(project?.data?.id);
  const mapConfigId =
    pages[currentPageIndex]?.page?.map_config_id || projectMapConfig?.data.id;
  const { data: fetchedMapConfig, isFetching: isFetchingMapConfig } =
    useMapConfigById(mapConfigId);

  const mapConfig = mapConfigId ? fetchedMapConfig : null;

  const mapLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

  // Emit event when page changes and map is fetched
  useEffect(() => {
    eventEmitter.emit(FORM_PAGE_CHANGE_EVENT);
  }, [currentPageIndex, isFetchingMapConfig, isFetchingProjectConfig]);

  const onDragDivider = useCallback(
    (event) => {
      event.preventDefault();
      // Change the height of the map container to match the drag event
      if (draggableDivRef.current) {
        const clientY = event?.changedTouches?.[0]?.clientY;
        // Don't allow the div to be dragged outside bounds of page
        if (clientY > 0 && clientY < document.body.clientHeight - 180) {
          draggableDivRef.current.style.height = `${clientY}px`;
        }
      }
    },
    [draggableDivRef]
  );

  useEffect(() => {
    const divider = dragDividerRef.current;
    if (divider) {
      divider.addEventListener('touchmove', onDragDivider);
    }

    return () => {
      if (divider) {
        divider.removeEventListener('touchmove', onDragDivider);
      }
    };
  }, [dragDividerRef, onDragDivider]);

  return {
    mapConfig,
    mapLayers,
    draggableDivRef,
    dragDividerRef,
  };
};

export default useEsriMapPage;
