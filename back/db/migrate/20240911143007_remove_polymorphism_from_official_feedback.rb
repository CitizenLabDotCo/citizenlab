class RemovePolymorphismFromOfficialFeedback < ActiveRecord::Migration[7.0]
  def change
    execute <<~SQL.squish
      DELETE FROM notifications
      WHERE official_feedback_id IN (
        SELECT id FROM official_feedbacks
        WHERE post_type IS NOT NULL AND post_type != 'Idea'
      );
    SQL
    execute <<~SQL.squish
      DELETE FROM official_feedbacks
      WHERE post_type IS NOT NULL AND post_type != 'Idea';
    SQL
    remove_column :official_feedbacks, :post_type, :string
    rename_column :official_feedbacks, :post_id, :idea_id
    add_foreign_key :official_feedbacks, :ideas, column: :idea_id
  end
end
