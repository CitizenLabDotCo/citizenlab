# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Que do
  let(:current_version) { described_class.db_version }

  describe '.migrate!' do
    # The goal of this test is to partially protect us from internal refactorings of Que
    # that would silently break our solution for making Que migrations compatible with
    # Apartment, which relies on patching `Que::Migrations.db_version`.
    it 'calls Que::Migrations.db_version' do
      # `twice` to account for the `current_version` let helper.
      expect(Que::Migrations).to receive(:db_version).and_call_original.twice

      # We use the current version to make the test lightweight (because then no migration
      # is actually run).
      described_class.migrate!(version: current_version)
    end
  end

  describe '.db_version' do
    before do
      current_schema = Tenant.current.schema_name
      ActiveRecord::Base.connection.execute("COMMENT ON TABLE #{current_schema}.que_jobs IS '4';")
      ActiveRecord::Base.connection.execute("COMMENT ON TABLE public.que_jobs IS '5';")
    end

    it 'returns the correct version for the current schema' do
      expect(described_class.db_version).to eq(4)
      Apartment::Tenant.reset
      expect(described_class.db_version).to eq(5)
    end
  end
end
