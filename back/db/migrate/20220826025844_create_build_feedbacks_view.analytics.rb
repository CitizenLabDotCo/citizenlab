# frozen_string_literal: true

# This migration comes from analytics (originally 20220624102332)

class CreateBuildFeedbacksView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_build_feedbacks
  end
end
