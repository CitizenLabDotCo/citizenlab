# Single use rake tasks
All rake tasks in this directory should be single use rake tasks that are run once only - usually required to perform complex data migrations or to fix data inconsistencies.

File names should start with the date the task was created in the format `YYYYMMDD`.

Any tests in the spec directory will NOT be run by CI as will often be dependent on the state of the database at a particular time. 

Any supporting single use services/classes should be placed in the `services` directory.