# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CitizenLab::Database::SchemaPostprocessor do
  let(:dump) do
    <<~DUMP
      DROP SCHEMA IF EXISTS shared_extensions;
      CREATE SCHEMA shared_extensions;
      CREATE TABLE public.ideas (id uuid);
    DUMP
  end

  it 'creates the extensions right after the shared_extensions schema' do
    processed = described_class.new(dump).process

    expect(processed).to match(/^CREATE SCHEMA shared_extensions;\n\n\n.*CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA shared_extensions;/m)
    expect(processed).to include('CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA shared_extensions;')
  end

  it 'drops the extensions before dropping the shared_extensions schema' do
    processed = described_class.new(dump).process

    expect(processed).to include(<<~SQL.chomp) # rubocop:disable Rails/SquishedSQLHeredocs
      DROP EXTENSION IF EXISTS pgcrypto;
      DROP SCHEMA IF EXISTS shared_extensions;
    SQL
  end

  it 'leaves the rest of the dump unchanged' do
    expect(described_class.new(dump).process).to include('CREATE TABLE public.ideas (id uuid);')
  end

  it 'raises when the dump has no shared_extensions schema' do
    expect { described_class.new('CREATE TABLE public.ideas (id uuid);').process }
      .to raise_error(/CREATE SCHEMA shared_extensions/)
  end

  it 'has been applied to the committed structure.sql' do
    structure = Rails.root.join('db/structure.sql').read

    expect(structure).to include('CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA shared_extensions;')
    expect(structure).to include('DROP EXTENSION IF EXISTS postgis;')
  end
end
