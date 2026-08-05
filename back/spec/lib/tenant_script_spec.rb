# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TenantScript do
  after { FileUtils.rm_f(Dir['a_script*.json'] + Dir['nullify_the_bad_thing*.json']) }

  # The real thing a rake task hands over, so that reading an argument the task never declared keeps
  # returning nil here the way it does in production.
  def task_args(execute: nil, host: nil)
    Rake::TaskArguments.new(%i[execute host], [execute, host])
  end

  # Every run announces its mode and prints a summary; only the examples about that output want it.
  def run_script(name = 'a_script', **, &)
    original = $stdout
    $stdout = StringIO.new
    described_class.run(name, **, &)
  ensure
    $stdout = original
  end

  def report(file = 'a_script.json')
    JSON.parse(File.read(file))
  end

  describe 'the tenant loop' do
    it 'yields each tenant, switched into it, and records it as processed' do
      switched_into = []

      reporter = run_script(args: task_args(execute: 'execute')) do |tenant, _script|
        switched_into << [tenant.host, Tenant.current.host]
      end

      expect(switched_into).to eq [[Tenant.current.host, Tenant.current.host]]
      expect(reporter.tenants).to eq [Tenant.current.host]
    end

    it 'limits the run to one tenant when passed a host' do
      other = create(:tenant, creation_finalized_at: Time.zone.now)
      processed = []

      run_script(args: task_args(execute: 'execute', host: other.host)) { |tenant, _s| processed << tenant.host }

      expect(processed).to eq [other.host]
    end

    it 'skips a tenant whose creation never finalized' do
      create(:tenant)
      processed = []

      run_script(args: task_args) { |tenant, _s| processed << tenant.host }

      expect(processed).to eq [Tenant.current.host]
    end

    it 'reaches that tenant when the script passes a scope that includes it' do
      unfinalized = create(:tenant)
      processed = []

      run_script(args: task_args, tenants: Tenant.not_deleted) { |tenant, _s| processed << tenant.host }

      expect(processed).to include unfinalized.host
    end

    # `Tenant.not_deleted` reaches tenants that have no schema to switch into, and switching into a
    # missing one raises before the script's own block ever runs.
    it 'skips a tenant that has no schema' do
      schemaless = create(:tenant, creation_finalized_at: Time.zone.now)
      Apartment::Tenant.drop(schemaless.schema_name)
      processed = []

      run_script(args: task_args, tenants: Tenant.not_deleted) { |tenant, _s| processed << tenant.host }

      expect(processed).not_to include schemaless.host
      expect(processed).to include Tenant.current.host
    end

    it 'carries on when one tenant raises, and records the failure' do
      other = create(:tenant, creation_finalized_at: Time.zone.now)
      processed = []

      reporter = run_script(args: task_args) do |tenant, _script|
        raise ArgumentError, 'no good' if tenant.host == other.host

        processed << tenant.host
      end

      expect(processed).to eq [Tenant.current.host]
      expect(reporter.errors).to eq [
        { error: 'ArgumentError: no good', context: { tenant: other.host } }
      ]
    end
  end

  describe 'the dry run' do
    it 'is the default, and is what the script is told' do
      modes = []
      run_script(args: task_args) { |_tenant, script| modes << [script.execute?, script.dry_run?] }
      expect(modes).to eq [[false, true]]
    end

    it "is off when the task is passed 'execute'" do
      modes = []
      run_script(args: task_args(execute: 'execute')) { |_tenant, script| modes << [script.execute?, script.dry_run?] }
      expect(modes).to eq [[true, false]]
    end

    it 'is not off for any other argument' do
      modes = []
      run_script(args: task_args(execute: 'yes')) { |_tenant, script| modes << script.execute? }
      expect(modes).to eq [false]
    end
  end

  describe 'the report' do
    it 'is named after the script' do
      run_script(args: task_args(execute: 'execute')) do |tenant, script|
        script.reporter.add_change('old', 'new', context: { tenant: tenant.host })
      end

      expect(report['changes']).to eq [
        { 'old_value' => 'old', 'new_value' => 'new', 'context' => { 'tenant' => Tenant.current.host } }
      ]
      expect(report['processed_tenants']).to eq [Tenant.current.host]
    end

    # So that a dry run can never be mistaken for the record of a run that wrote something.
    it 'is written to a separate file on a dry run' do
      run_script(args: task_args) { |_tenant, _script| nil }

      expect(File).not_to exist 'a_script.json'
      expect(report('a_script_dry_run.json')['processed_tenants']).to eq [Tenant.current.host]
    end
  end

  describe 'the summary' do
    it 'counts what the script recorded' do
      expect do
        described_class.run('a_script', args: task_args(execute: 'execute')) do |_tenant, script|
          script.reporter.add_change('old', 'new')
          script.reporter.add_delete('Thing', '123')
        end
      end.to output(
        /EXECUTION SUMMARY:\n\s+Processed: 1 tenant\(s\)\n\s+Changes: 1\n\s+Deletes: 1\n\s+Errors: 0/
      ).to_stdout
    end

    it 'says nothing was written on a dry run' do
      expect do
        described_class.run('a_script', args: task_args) do |_tenant, script|
          script.reporter.add_change('old', 'new')
        end
      end.to output(/DRY RUN SUMMARY:.+Changes: 1 \(not written — dry run\)/m).to_stdout
    end

    it 'says so when there was nothing to do' do
      expect do
        described_class.run('a_script', args: task_args) { |_tenant, _script| nil }
      end.to output(/Nothing to do/).to_stdout
    end

    it 'prints the detail the script adds to it' do
      summary = ->(script) { puts "   #{script.reporter.changes.size} thing(s) in my own words" }

      expect do
        described_class.run('a_script', args: task_args, summary: summary) do |_tenant, script|
          script.reporter.add_change('old', 'new')
        end
      end.to output(/Errors: 0\n\s+1 thing\(s\) in my own words/).to_stdout
    end
  end

  describe 'the banner' do
    it 'warns that an execute run writes' do
      expect do
        described_class.run('a_script', args: task_args(execute: 'execute'), description: 'doing the thing') { nil }
      end.to output(/🚀 EXECUTE MODE: doing the thing\.\n⚠️  THIS WILL MODIFY THE DATABASE/).to_stdout
    end

    it 'warns that a dry run does not' do
      expect do
        described_class.run('a_script', args: task_args) { nil }
      end.to output(/🔍 DRY RUN MODE.+\n⚠️  NO DATABASE WRITES WILL BE PERFORMED/).to_stdout
    end

    it 'falls back to the name of the script when given no description' do
      expect do
        described_class.run('nullify_the_bad_thing', args: task_args(execute: 'execute')) { nil }
      end.to output(/EXECUTE MODE: nullify the bad thing\./).to_stdout
    end

    it 'names the tenant a run is limited to' do
      other = create(:tenant, creation_finalized_at: Time.zone.now)

      expect do
        described_class.run('a_script', args: task_args(host: other.host)) { nil }
      end.to output(/Limited to tenant: #{Regexp.escape(other.host)}/).to_stdout
    end
  end
end
