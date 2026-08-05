# frozen_string_literal: true

# Runs a data script across tenants, so that a rake task in `lib/tasks/single_use` only has to
# express what it does to one tenant's data.
#
# Almost every one of those tasks repeats the same frame by hand: read an `execute` argument to
# decide whether this is a dry run, announce the mode, loop over the tenants, guard the loop so one
# unreachable tenant cannot abort the rest, collect everything into a ScriptReporter, print a
# summary and write the report to a JSON file named after the task. This owns that frame.
#
#     namespace :single_use do
#       task :nullify_bad_thing, %i[execute host] => [:environment] do |_t, args|
#         TenantScript.run('nullify_bad_thing', args: args, description: 'nullifying the bad thing') do |tenant, script|
#           Thing.where(bad: true).find_each do |thing|
#             script.reporter.add_change(thing.value, nil, context: { tenant: tenant.host, thing_id: thing.id })
#             thing.update_column(:value, nil) if script.execute?
#           end
#         end
#       end
#     end
#
# The task must declare an `execute` argument, and may declare a `host` one to limit a run to a
# single tenant. Nothing is written unless the task is passed 'execute': the dry run deliberately
# stays the default, and enforcing it remains the task's own job — this only hands it `execute?`.
# Doing more (rolling back a transaction, say) would silence writes the task never told us about.
#
#     rake single_use:nullify_bad_thing                     # dry run, all tenants
#     rake 'single_use:nullify_bad_thing[execute]'          # write, all tenants
#     rake 'single_use:nullify_bad_thing[execute,foo.com]'  # write, one tenant
#
# Two things stay with the task, because they are where these scripts genuinely differ:
#
# - **Which tenants.** `Tenant.safe_switch_each`'s scope is the default, but it is not always right:
#   it skips tenants whose creation never finalized, and a task preparing data for a stricter rule
#   has to reach those too, since they are on their way to being live. Pass `tenants:` for that.
#   The loop below is this class's own rather than `safe_switch_each` itself; see `each_tenant`.
# - **What the summary says.** The counts below are all this can know. A task that wants to print
#   the affected records, or group them, passes `summary:` and prints its own detail after them.
class TenantScript
  # `Tenant.safe_switch_each`'s default scope. A tenant whose creation never finalized is half-built
  # and a deleted one is on its way out, so a script has to opt in to either.
  def self.default_tenants
    Tenant.not_deleted.where.not(creation_finalized_at: nil)
  end

  # `name` names both the task and the report file it writes.
  def self.run(name, args:, description: nil, tenants: nil, summary: nil, &)
    new(name, args: args, description: description, tenants: tenants).run(summary: summary, &)
  end

  attr_reader :name, :reporter, :host

  def initialize(name, args:, description: nil, tenants: nil)
    @name = name.to_s
    @description = description || @name.humanize.downcase
    @execute = args[:execute] == 'execute'
    @host = args[:host].presence
    @tenants = tenants
    @reporter = ScriptReporter.new
  end

  def execute?
    @execute
  end

  def dry_run?
    !@execute
  end

  # Yields each tenant, switched into, together with this script. Returns the reporter, so a caller
  # that wants to assert on what happened does not have to reach for the JSON.
  def run(summary: nil)
    print_banner
    each_tenant { |tenant| yield tenant, self }
    print_summary(summary)
    write_report
    reporter
  end

  def report_file
    dry_run? ? "#{name}_dry_run.json" : "#{name}.json"
  end

  private

  # These scripts are run by hand at a terminal, where their output is the whole point. Rails.logger
  # would send it to a file in production that nobody watching the run is reading, so every task
  # this replaces printed to stdout, and so does this.
  # rubocop:disable Rails/Output

  # This repeats most of `Tenant.safe_switch_each` on purpose, and not because that method fixes its
  # scope — it takes one. It is that it prioritizes the scope first, and `Tenant.prioritize` reads
  # `app_configurations` out of every schema in the scope by name in a single UNION, then indexes
  # the result back against the tenant list. Neither step is defensive: a tenant in the scope with
  # no schema raises `ActiveRecord::StatementInvalid` there, and one whose schema holds no
  # app_configuration row raises `ArgumentError` from the sort — both before the first tenant is
  # visited, taking the whole run with them rather than that one tenant.
  #
  # Neither state should exist. `MultiTenancy::TenantService#initialize_tenant` saves the tenant and
  # its configuration in one transaction, and nothing else creates a tenant, so the narrow default
  # scope has never had to defend against either. But these scripts run against data that has
  # already drifted out of states the code calls impossible, over hundreds of tenants, unattended.
  # The guard below is one cheap query, it is what the tasks this replaces already do
  # (`20260709_fix_phase_available_views.rake` and the predecessor of the task that prompted this,
  # `20260721_migrate_proposals_phases_off_feed_view.rake`), and it costs a skipped tenant where
  # delegating would cost the run.
  #
  # The lifecycle ordering goes with it: no data repair depends on the order it visits tenants in.
  def each_tenant
    tenant_scope.each do |tenant|
      # A run over every tenant is long enough to outlive one of them, so the record is re-read
      # rather than trusted from the scope. The schema is checked before switching into it, because
      # `switch` raises `Apartment::TenantNotFound` when it is missing, and raises it before the
      # block, where nothing this class hands the script could catch it.
      next unless Tenant.exists?(id: tenant.id)
      next unless ActiveRecord::Base.connection.schema_exists?(tenant.schema_name)

      reporter.add_processed_tenant(tenant)
      tenant.switch { yield tenant }
    rescue StandardError => e
      # One failing tenant must not abort the run, but it must be impossible to miss.
      puts "❌ ERROR on #{tenant.host}: #{e.class}: #{e.message}"
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
    end
  end

  # `host` narrows the scope rather than replacing it, so limiting a run to one tenant cannot also
  # widen it past whatever the script asked for.
  def tenant_scope
    scope = @tenants || self.class.default_tenants
    return scope unless host

    narrowed = scope.where(host: host)
    if narrowed.empty?
      # Otherwise a mistyped host, or one whose tenant has since been deleted, reads as a clean run
      # over nothing: no changes, no errors, "Nothing to do". Refusing to start is the only honest
      # answer, since a run aimed at one tenant that reached none did not do what it was asked.
      raise ArgumentError, "no tenant matches host #{host.inspect}"
    end

    narrowed
  end

  def print_banner
    if execute?
      puts "🚀 EXECUTE MODE: #{@description}."
      puts '⚠️  THIS WILL MODIFY THE DATABASE'
    else
      puts "🔍 DRY RUN MODE: analysing without writing (#{@description})."
      puts '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    end
    puts "   Limited to tenant: #{host}" if host
    puts '=' * 80
  end

  def print_summary(custom)
    puts "\n#{'=' * 80}"
    puts(execute? ? '📊 EXECUTION SUMMARY:' : '📊 DRY RUN SUMMARY:')
    puts "   Processed: #{reporter.tenants.size} tenant(s)"

    counts = {
      'Creates' => reporter.creates.size,
      'Changes' => reporter.changes.size,
      'Deletes' => reporter.deletes.size
    }.reject { |_label, count| count.zero? }

    if counts.empty?
      puts '   Nothing to do'
    else
      suffix = execute? ? '' : ' (not written — dry run)'
      counts.each { |label, count| puts "   #{label}: #{count}#{suffix}" }
    end
    puts "   Errors: #{reporter.errors.size}"

    custom&.call(self)
  end

  def write_report
    reporter.report!(report_file)
    puts "\n   📝 Report: #{report_file}"
  end
  # rubocop:enable Rails/Output
end
