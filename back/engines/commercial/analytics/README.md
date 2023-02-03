# Analytics
This is a separate analytics engine, which separates out the data for dashboard from the main operational data
using both database views on the existing data tables and data copied from other sources. 
The data is modelled following the conventions of a **star schema**.

These views and tables sit in the same tenant schema. However, in the future it is intended
that these analytics tables and views may be moved to schemas in an entirely separate database.

### Copying migrations & views

In case you add new views through a new migration (as you should), you still need to make sure they are copied to the migrations of the main app as well. You can do so with the following command.

```
rails analytics:install:migrations
```

Views are copied across when the migration is run.

### Naming conventions

Views and tables should be named as follows:

* analytics_dimension_* - holds dimensions by which the facts can be filtered
* analytics_fact_* - holds 'facts' - the actual data we're interested in 
such as posts, participations, visits

