class UpdateOfficialFeedbackWithPolymorphicFeedbackItem < ActiveRecord::Migration[5.2]
  def change
    rename_column :official_feedbacks, :idea_id, :feedback_item_id
    remove_foreign_key :official_feedbacks, column: :feedback_item_id
    add_column :official_feedbacks, :feedback_item_type, :string

    add_index :official_feedbacks, [:feedback_item_id, :feedback_item_type], name: 'index_official_feedbacks_on_feedback_item'

    OfficialFeedback.update_all(feedback_item_type: 'Idea')
  end
end
