# frozen_string_literal: true

class AddEditingLockedAndVotingStartedAtToInitiatives < ActiveRecord::Migration[7.0]
  class StubInitiative < ActiveRecord::Base # rubocop:disable Rails/ApplicationRecord
    self.table_name = 'initiatives'
  end

  def change
    add_column :initiatives, :editing_locked, :boolean, default: false, null: false
    add_column :initiatives, :voting_started_at, :datetime

    reversible do |dir|
      dir.up do
        StubInitiative.find_each do |initiative|
          initiative.update!(voting_started_at: initiative.published_at)
        end
      end
    end
  end
end
