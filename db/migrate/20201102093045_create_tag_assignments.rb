class CreateTagAssignments < ActiveRecord::Migration[5.0]
  def change
    create_table :tag_assignments do |t|
      t.column :assignment_method, :integer, default: 0
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :tag, foreign_key: true, type: :uuid, index: true

      t.timestamps
    end
  end
end
