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

### Testing queries in your dev env

You can use this request in the browser developer console.
```js
fetch(window.location.origin + "/web_api/v1/analytics", {
  headers: {
    authorization: `Bearer ${document.cookie.split("; ").find((x) => x.startsWith("cl2_jwt")).replace("cl2_jwt=", "")}`,
    "content-type": "application/json",
  },
  body: `{
    "query": {
      "fact": "participation",
      "groups": "dimension_user_custom_field_values.value",
      "filters": {
        "dimension_user_custom_field_values.key": "gender"
      },
      "aggregations": {
        "dimension_user_custom_field_values.dimension_user_id": "count"
      }
    }
  }`,
  method: "POST",
})
  .then((response) => response.json())
  .then((data) => {
    console.log(JSON.stringify(data.data, null, 2));
    console.log(data);
  });
```
