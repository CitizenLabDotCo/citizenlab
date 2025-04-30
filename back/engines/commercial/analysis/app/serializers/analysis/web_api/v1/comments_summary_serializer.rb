# frozen_string_literal: true

class Analysis::WebApi::V1::CommentsSummarySerializer < WebApi::V1::BaseSerializer
  attributes :summary, :accuracy, :created_at, :updated_at, :generated_at, :missing_comments_count, :comments_count

  belongs_to :background_task, class_name: 'Analysis::BackgroundTask'
end
