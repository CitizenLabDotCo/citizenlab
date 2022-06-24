class CreateBuildFeedbacksView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_build_feedbacks, materialized: true

    add_index :analytics_build_feedbacks, :post_id

  end
end
