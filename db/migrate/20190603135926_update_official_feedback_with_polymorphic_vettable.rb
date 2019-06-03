class UpdateOfficialFeedbackWithPolymorphicVettable < ActiveRecord::Migration[5.2]
  def change
    rename_column :official_feedbacks, :idea_id, :vettable_id
    remove_foreign_key :official_feedbacks, column: :vettable_id
    add_column :official_feedbacks, :vettable_type, :string

    add_index :official_feedbacks, [:vettable_id, :vettable_type]

    OfficialFeedback.update_all(vettable_type: 'Idea')
  end
end
