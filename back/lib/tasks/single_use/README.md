# Single use rake tasks
All rake tasks in this directory should be single use rake tasks that are run once only - usually required to perform complex data migrations or to fix data inconsistencies.

File names should start with the date the task was created in the format `YYYYMMDD`.

Any tests should be placed in spec/tasks/single_use and named `*_spec.ignore.rb` once the task has been released and run so that CI does not run these tests . 

Can rake not find your task? Double check that you gave it a .rake and not a .rb extension. (tricks me every time!)

Any supporting single use services/classes should be placed in the `services` directory.