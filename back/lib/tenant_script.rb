# frozen_string_literal: true

# Runs a data script across tenants, so that a rake task in `lib/tasks/single_use` only has to
# express what it does to one tenant's data. It owns the frame those tasks otherwise repeat by
# hand: the dry run switch, the tenant loop, the ScriptReporter, the summary and the JSON report.
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
#     rake single_use:nullify_bad_thing                     # dry run, all tenants
#     rake 'single_use:nullify_bad_thing[execute]'          # write, all tenants
#     rake 'single_use:nullify_bad_thing[execute,foo.com]'  # write, one tenant
#
# The task declares the `execute` argument, and `host` if a run should be limitable to one tenant.
# Enforcing the dry run stays with the task, which alone knows which of its work writes: guard with
# `script.execute?`. Pass `tenants:` where `safe_switch_each`'s scope is the wrong one — it skips
# tenants whose creation never finalized, which a task preparing data for a stricter rule still has
# to reach — and `summary:` to print more than the counts.
class TenantScript
  # What `Tenant.safe_switch_each` iterates when given no scope.
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

  # Yields each tenant, switched into, with this script. Returns the reporter, so that asserting on
  # a run does not mean reading the JSON back.
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

  # These scripts are run by hand at a terminal, where the output is the point; Rails.logger would
  # send it to a production file nobody watching the run is reading.
  # rubocop:disable Rails/Output

  # `safe_switch_each` skips tenants deleted since the scope was read and tenants whose schema is
  # gone, leaving the bookkeeping and keeping one failing tenant from costing the run.
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

  # `host` narrows the scope, never widens it, and narrowing it to nothing is a mistake rather than
  # a run: left alone, a mistyped host reads as a clean pass over nothing.
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
