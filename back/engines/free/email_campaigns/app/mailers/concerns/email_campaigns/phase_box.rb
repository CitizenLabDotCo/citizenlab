# frozen_string_literal: true

module EmailCampaigns
  module PhaseBox
    extend ActiveSupport::Concern

    DESCRIPTION_PREVIEW_LENGTH = 200

    included do
      helper_method :phase_dates, :phase_description_preview
    end

    private

    def phase_dates
      return if event&.phase_start_at.blank? || event.phase_end_at.blank?

      format_message('phase_dates', component: 'general', values: {
        startDate: localize_date_for_recipient(event.phase_start_at),
        endDate: localize_date_for_recipient(event.phase_end_at)
      })
    end

    def phase_description_preview
      return if localize_for_recipient(event&.phase_description_multiloc).blank?

      truncated = localize_for_recipient_and_truncate(event.phase_description_multiloc, DESCRIPTION_PREVIEW_LENGTH)
      ActionView::Base.full_sanitizer.sanitize(truncated).presence
    end
  end
end
