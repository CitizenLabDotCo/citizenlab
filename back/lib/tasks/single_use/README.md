# Single use rake tasks
All rake tasks in this directory should be single use rake tasks that are run once only - usually required to perform complex data migrations or to fix data inconsistencies.

Any tests in the spec directory are NOT run by CI as will often be dependent on the state of the database at a particular time. 