# frozen_string_literal: true

class CreateBuildFeedbacksView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_build_feedbacks
  end
end
