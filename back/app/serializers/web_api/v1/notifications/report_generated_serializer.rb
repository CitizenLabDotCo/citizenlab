# frozen_string_literal: true

class WebApi::V1::Notifications::ReportGeneratedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end

  attribute :report_id do |object|
    object.report_id
  end

  # The run was stopped — by the admin, the clock or the round cap — before the model
  # said it was done. The report is saved either way; the reader should know it may
  # not be whole.
  attribute :stopped_early do |object|
    object.report&.last_generation&.stopped_early? || false
  end
end
