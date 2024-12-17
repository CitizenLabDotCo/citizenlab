# frozen_string_literal: true

class AddProjectReviewToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_reference :notifications, :project_review, foreign_key: true, type: :uuid
  end
end
