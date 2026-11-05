# Single use rake tasks
All rake tasks in this directory should be single use rake tasks that are run once only - usually required to perform complex data migrations or to fix data inconsistencies.

File names should start with the date the task was created in the format `YYYYMMDD`.

Any tests should be placed in spec/tasks/single_use and named `*_spec.ignore.rb` once the task has been released and run so that CI does not run these tests . 

Can rake not find your task? Double check that you gave it a .rake and not a .rb extension. (tricks me every time!)

Any supporting single use services/classes should be placed in the `services` directory.

## TenantScript

Most of these tasks need the same frame: a dry run unless the task is passed `execute`, a loop over the tenants that one unreachable tenant cannot abort, a `ScriptReporter`, a summary and a JSON report. `TenantScript` (`lib/tenant_script.rb`) owns that frame, so a new task only has to write what it does to one tenant's data:

```ruby
namespace :single_use do
  desc "Nullify the bad thing. Dry run unless passed 'execute'."
  task :nullify_bad_thing, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run('nullify_bad_thing', args: args, description: 'nullifying the bad thing') do |tenant, script|
      Thing.where(bad: true).find_each do |thing|
        script.reporter.add_change(thing.value, nil, context: { tenant: tenant.host, thing_id: thing.id })
        thing.update_column(:value, nil) if script.execute?
      end
    end
  end
end
```

Declare an `execute` argument, and a `host` one if a run should be limitable to a single tenant. Enforcing the dry run stays with the task — guard your writes with `script.execute?`.

Pass `tenants:` when `Tenant.safe_switch_each`'s scope is the wrong one (it skips tenants whose creation never finalized, which a task preparing data for a stricter validation still has to reach), and `summary:` when the run should print more than the counts. See the class for the rest.