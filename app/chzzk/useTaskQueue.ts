import React from 'react';

export function useTaskQueue(params: { shouldProcess: boolean }): {
  tasks: ReadonlyArray<Task>;
  isProcessing: boolean;
  addTask: (task: () => void) => void;
} {
  const [queue, setQueue] = React.useState<{
    isProcessing: boolean;
    tasks: Array<Task>;
  }>({ isProcessing: false, tasks: [] });

  React.useEffect(() => {
    if (!params.shouldProcess) return;
    if (queue.tasks.length === 0) return;
    if (queue.isProcessing) return;

    const task = queue.tasks[0];
    setQueue((prev) => ({
      isProcessing: true,
      tasks: prev.tasks.slice(1),
    }));

    void Promise.resolve(task()).finally(() => {
      setQueue((prev) => ({
        isProcessing: false,
        tasks: prev.tasks,
      }));
    });
  }, [queue, params.shouldProcess]);

  return {
    tasks: queue.tasks,
    isProcessing: queue.isProcessing,
    addTask: React.useCallback((task) => {
      setQueue((prev) => ({
        isProcessing: prev.isProcessing,
        tasks: [...prev.tasks, task],
      }));
    }, []),
  };
}

type Task = () => Promise<void> | void;
