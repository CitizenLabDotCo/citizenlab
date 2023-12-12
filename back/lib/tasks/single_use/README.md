# Single use rake tasks
All rake tasks in this directory should be single use rake tasks that are run once only - usually required to perform complex data migrations or to fix data inconsistencies.

File names should start with the date the task was created in the format `YYYYMMDD`.

Any tests should be placed in spec/tasks/single_use with `before { skip }` added to the start so that CI does not run the tests. 

Any supporting single use services/classes should be placed in the `services` directory.