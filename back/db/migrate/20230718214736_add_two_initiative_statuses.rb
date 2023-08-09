# frozen_string_literal: true

class AddTwoInitiativeStatuses < ActiveRecord::Migration[7.0]
  class StubInitiativeStatus < ActiveRecord::Base # rubocop:disable Rails/ApplicationRecord
    self.table_name = 'initiative_statuses'
  end

  def change
    reversible do |dir|
      dir.up do
        service = MultilocService.new

        proposed = StubInitiativeStatus.find_by(code: 'proposed')
        return unless proposed

        proposed.ordering = 150
        proposed.save!

        ap = StubInitiativeStatus.find_or_initialize_by(code: 'review_pending')
        ap.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.review_pending', locales: CL2_SUPPORTED_LOCALES
        )
        ap.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.review_pending_description', locales: CL2_SUPPORTED_LOCALES
        )
        ap.ordering = 50
        ap.color = '#CC9331'
        ap.save!

        ar = StubInitiativeStatus.find_or_initialize_by(code: 'requires_changes')
        ar.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.requires_changes', locales: CL2_SUPPORTED_LOCALES
        )
        ar.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.requires_changes_description', locales: CL2_SUPPORTED_LOCALES
        )
        ar.ordering = 100
        ar.color = '#CC317E'
        ar.save!
      end
    end
  end
end
