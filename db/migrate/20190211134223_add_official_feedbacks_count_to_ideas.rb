class AddOfficialFeedbacksCountToIdeas < ActiveRecord::Migration[5.2]
  def change
    add_column :ideas, :official_feedbacks_count, :integer, null: false, default: 0
  end
end
