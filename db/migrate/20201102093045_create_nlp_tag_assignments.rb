class CreateTagAssignments < ActiveRecord::Migration[5.0]
  def change
    create_table :tag_assignments do |t|
      t.string :assignment_method, null: false
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :tag, foreign_key: true, type: :uuid, index: true

      t.timestamps
    end
  end
end
