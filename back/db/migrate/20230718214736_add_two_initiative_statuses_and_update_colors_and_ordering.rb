# frozen_string_literal: true

class AddTwoInitiativeStatusesAndUpdateColorsAndOrdering < ActiveRecord::Migration[7.0]
  class StubInitiativeStatus < ActiveRecord::Base # rubocop:disable Rails/ApplicationRecord
    self.table_name = 'initiative_statuses'
  end

  def change
    reversible do |dir|
      dir.up do
        service = MultilocService.new

        proposed = StubInitiativeStatus.find_by(code: 'proposed')
        proposed&.update!(ordering: 150)
        proposed.update!(color: '#BEE7EB') if proposed&.color == '#687782'

        threshold_reached = StubInitiativeStatus.find_by(code: 'threshold_reached')
        threshold_reached&.update!(ordering: 200)
        threshold_reached.update!(color: '#40B8C5') if threshold_reached&.color == '#04884C'

        answered = StubInitiativeStatus.find_by(code: 'answered')
        answered&.update!(ordering: 300)
        answered.update!(color: '#147985') if answered&.color == '#04884C'

        expired = StubInitiativeStatus.find_by(code: 'expired')
        expired&.update!(ordering: 400)
        expired.update!(color: '#FF672F') if expired&.color == '#01A1B1'

        # We don't update the color of the 'ineligible' status, because the deault color remains in use
        StubInitiativeStatus.find_by(code: 'ineligible')&.update!(ordering: 500)

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
