# frozen_string_literal: true

class StripMentionsFromReportingOfficialFeedbacks < ActiveRecord::Migration[7.2]
  # Only the body expression changes, so replace_view works both ways and keeps
  # analytics_reader's grant.
  def up
    replace_view :reporting_official_feedbacks, version: 2
  end

  def down
    replace_view :reporting_official_feedbacks, version: 1
  end
end
