# frozen_string_literal: true

class WebApi::V1::Notifications::ReportGeneratedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end

  attribute :report_id do |object|
    object.report_id
  end
end
