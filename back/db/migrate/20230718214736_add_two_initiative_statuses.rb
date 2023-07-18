# frozen_string_literal: true

class AddTwoInitiativeStatuses < ActiveRecord::Migration[7.0]
  class StubInitiativeStatus < ActiveRecord::Base # rubocop:disable Rails/ApplicationRecord
    self.table_name = 'initiative_statuses'
  end

  def change
    reversible do |dir|
      dir.up do
        service = MultilocService.new

        ap = StubInitiativeStatus.find_or_initialize_by(code: 'approval_pending')
        ap.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.approval_pending', locales: CL2_SUPPORTED_LOCALES
        )
        ap.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.approval_pending_description', locales: CL2_SUPPORTED_LOCALES
        )
        ap.ordering = 50
        ap.color = '#CC9331'
        ap.save!

        ar = StubInitiativeStatus.find_or_initialize_by(code: 'approval_rejected')
        ar.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.approval_rejected', locales: CL2_SUPPORTED_LOCALES
        )
        ar.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.approval_rejected_description', locales: CL2_SUPPORTED_LOCALES
        )
        ar.ordering = 100
        ar.color = '#CC317E'
        ar.save!

        proposed = StubInitiativeStatus.find_or_initialize_by(code: 'proposed')
        proposed.ordering = 150
        proposed.save!
      end
    end
  end
end
