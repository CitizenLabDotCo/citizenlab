import { API_PATH } from 'containers/App/constants';
import { useState, useEffect } from 'react';
import { of, timer } from 'rxjs';
import { IPendingTask, pendingTasksStream } from 'services/pendingTasks';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';

export interface IUsePendingTasks {
  pendingTasks: IPendingTask[] | null | undefined;
}

export default function usePendingTasks() {
  const [pendingTasks, setPendingTasks] = useState<
    IPendingTask[] | null | undefined
  >(undefined);

  const [processing, setProcessing] = useState(false);
  const [unprocessedItemsIds, setUnprocessedgItemsIds] = useState<
    string[] | null
  >();

  useEffect(() => {
    const observable = pendingTasksStream().observable;

    const subscriptions = [
      observable.subscribe((response) => {
        const tasks = !isNilOrError(response) ? response.data : null;
        setPendingTasks(tasks);
        if (tasks) {
          const remainingItems = [
            ...new Set(
              tasks?.flatMap((task) =>
                task.relationships.ideas.data.map((relObj) => relObj.id)
              )
            ),
          ];
          if (remainingItems.length > 0) {
            setProcessing(true);
            setUnprocessedgItemsIds(remainingItems);
          } else {
            setProcessing(false);
            setUnprocessedgItemsIds(null);
          }
        }
      }),
      ...[
        processing
          ? timer(5000, 5000).subscribe((_) =>
              streams.fetchAllWith({
                apiEndpoint: [
                  `${API_PATH}/taggings`,
                  `${API_PATH}/tags`,
                  `${API_PATH}/pending_tasks`,
                ],
              })
            )
          : of(null).subscribe(),
      ],
    ];

    return () => subscriptions.forEach((sub) => sub.unsubscribe());
  }, [processing]);

  return {
    pendingTasks,
    processing,
    unprocessedItemsIds,
    processingRemainingItemsCount: unprocessedItemsIds?.length,
  };
}
