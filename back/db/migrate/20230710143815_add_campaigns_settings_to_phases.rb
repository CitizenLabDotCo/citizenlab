# frozen_string_literal: true

class AddCampaignsSettingsToPhases < ActiveRecord::Migration[7.0]
  # rubocop:disable Rails/ApplicationRecord
  class StubPhase < ActiveRecord::Base
    self.table_name = 'phases'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    add_column :phases, :campaigns_settings, :jsonb, default: {}

    reversible do |dir|
      dir.up do
        enabled = EmailCampaigns::Campaign.find_by(type: 'EmailCampaigns::Campaigns::ProjectPhaseStarted')&.enabled
        StubPhase.reset_column_information
        StubPhase.update_all(
          campaigns_settings: { 'project_phase_started' => enabled }
        )
      end
    end
  end
end
