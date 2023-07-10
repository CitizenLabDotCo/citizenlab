# frozen_string_literal: true

class AddEmailsToPhases < ActiveRecord::Migration[7.0]
  # rubocop:disable Rails/ApplicationRecord
  class StubPhase < ActiveRecord::Base
    self.table_name = 'phases'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    add_column :phases, :emails, :jsonb, default: {}

    reversible do |dir|
      dir.up do
        StubPhase.reset_column_information
        StubPhase.update_all(emails: { 'project_phase_started' => true })
      end
    end
  end
end
