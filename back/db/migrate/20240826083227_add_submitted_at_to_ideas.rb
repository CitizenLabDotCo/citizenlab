class AddSubmittedAtToIdeas < ActiveRecord::Migration[7.0]
  def change
    add_column :ideas, :submitted_at, :datetime, null: true
    rename_column :phases, :posting_enabled, :submission_enabled

    execute <<~SQL.squish
      UPDATE ideas
      SET submitted_at = published_at
      WHERE publication_status != 'draft' AND published_at IS NOT NULL;
    SQL
    execute <<~SQL.squish
      UPDATE ideas
      SET submitted_at = created_at
      WHERE publication_status != 'draft' AND submitted_at IS NULL;
    SQL
  end
end
