class UpdateOfficialFeedbackWithPolymorphicPost < ActiveRecord::Migration[5.2]
  def change
    rename_column :official_feedbacks, :idea_id, :post_id
    remove_foreign_key :official_feedbacks, column: :post_id
    add_column :official_feedbacks, :post_type, :string

    add_index :official_feedbacks, [:post_id, :post_type], name: 'index_official_feedbacks_on_post'

    OfficialFeedback.update_all(post_type: 'Idea')
  end
end
