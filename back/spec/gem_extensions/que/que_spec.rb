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

      # We use the current version to make the test lightweight (because not migration
      # is run).
      described_class.migrate!(version: current_version)
    end
  end
end
