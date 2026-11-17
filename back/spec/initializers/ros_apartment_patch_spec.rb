# frozen_string_literal: true

require 'rails_helper'

# The patches reach into private methods and constants of ros-apartment's SQL-based schema
# adapter, so these specs guard tenant creation across ros-apartment and Rails upgrades.
RSpec.describe Apartment::Adapters::PostgresqlSchemaFromSqlAdapter do
  let(:adapter) { Apartment::Tenant.adapter }

  it 'is the adapter in use, with the dump memoization applied' do
    expect(adapter).to be_a(described_class)
    expect(described_class.ancestors).to include(Apartment::Adapters::MemoizedPgDumpSchema)
  end

  describe '#patch_search_path' do
    it 'drops the \\restrict and \\unrestrict lines of recent pg_dump versions' do
      dump = <<~DUMP
        \\restrict abc123
        CREATE TABLE public.ideas (id uuid);
        \\unrestrict abc123
      DUMP

      patched = adapter.send(:patch_search_path, dump)

      expect(patched).not_to match(/restrict/)
      expect(patched).to include('CREATE TABLE')
    end
  end

  describe '#pg_dump_schema' do
    around do |example|
      Apartment::Adapters::MemoizedPgDumpSchema.cache.clear
      example.run
      Apartment::Adapters::MemoizedPgDumpSchema.cache.clear
    end

    before do
      allow(adapter).to receive(:with_pg_env).and_return('first dump', 'second dump')
    end

    it 'dumps the schema once per schema version' do
      2.times { adapter.send(:pg_dump_schema) }

      expect(adapter.send(:pg_dump_schema)).to eq('first dump')
      expect(adapter).to have_received(:with_pg_env).once
    end

    it 'dumps the schema again when the schema version changes' do
      adapter.send(:pg_dump_schema)
      allow(ActiveRecord::Migrator).to receive(:current_version).and_return(1)

      expect(adapter.send(:pg_dump_schema)).to eq('second dump')
    end
  end
end
