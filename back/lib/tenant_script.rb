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
# - **What the summary says.** The counts below are all this can know. A task that wants to print
#   the affected records, or group them, passes `summary:` and prints its own detail after them.
class TenantScript
  # What `Tenant.safe_switch_each` iterates when given no scope: a tenant whose creation never
  # finalized is half-built and a deleted one is on its way out, so a script has to opt in to either.
  def self.default_tenants
    Tenant.creation_finalized
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

  # `safe_switch_each` skips a tenant that was deleted since the scope was read, and one it cannot
  # rank — which is any it cannot reach — so all that is left here is the bookkeeping and making
  # sure one failing tenant costs only itself.
  def each_tenant
    check_host!

    Tenant.safe_switch_each(scope: @tenants, host: host) do |tenant|
      reporter.add_processed_tenant(tenant)
      yield tenant
    rescue StandardError => e
      # One failing tenant must not abort the run, but it must be impossible to miss.
      puts "❌ ERROR on #{tenant.host}: #{e.class}: #{e.message}"
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
    end
  end

  # `host` narrows the scope rather than replacing it, so limiting a run to one tenant cannot also
  # widen it past whatever the script asked for — and a host that narrows it to nothing is a
  # mistake, not a run. Left alone, a mistyped host, or one whose tenant has since been deleted,
  # reads as a clean run over nothing: no changes, no errors, "Nothing to do".
  def check_host!
    return if host.blank?
    return if (@tenants || self.class.default_tenants).exists?(host: host)

    raise ArgumentError, "no tenant matches host #{host.inspect}"
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
