# frozen_string_literal: true

class AddTwoInitiativeStatusesAndUpdateColors < ActiveRecord::Migration[7.0]
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
        proposed.color = '#BEE7EB'
        proposed.save!

        threshold_reached = StubInitiativeStatus.find_by(code: 'threshold_reached')
        return unless threshold_reached

        threshold_reached.color = '#40B8C5'
        threshold_reached.save!

        expired = StubInitiativeStatus.find_by(code: 'expired')
        return unless expired

        expired.color = '#FF672F'
        expired.save!

        answered = StubInitiativeStatus.find_by(code: 'answered')
        return unless answered

        answered.color = '#147985'
        answered.save!

        ineligible = StubInitiativeStatus.find_by(code: 'ineligible')
        return unless ineligible

        ineligible.color = '#E52516'
        ineligible.save!

        rp = StubInitiativeStatus.find_or_initialize_by(code: 'review_pending')
        rp.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.review_pending', locales: CL2_SUPPORTED_LOCALES
        )
        rp.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.review_pending_description', locales: CL2_SUPPORTED_LOCALES
        )
        rp.ordering = 50
        rp.color = '#767676'
        rp.save!

        cr = StubInitiativeStatus.find_or_initialize_by(code: 'changes_requested')
        cr.title_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.changes_requested', locales: CL2_SUPPORTED_LOCALES
        )
        cr.description_multiloc = service.i18n_to_multiloc(
          'initiative_statuses.changes_requested_description', locales: CL2_SUPPORTED_LOCALES
        )
        cr.ordering = 100
        cr.color = '#BDBDBD'
        cr.save!
      end
    end
  end
end
