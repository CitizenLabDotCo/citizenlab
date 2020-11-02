class CreateNLPTagAssignments < ActiveRecord::Migration[5.0]
  def change
    create_table :nlp_tag_assignments, id: :uuid do |t|
      t.string :assignment_method, null: false
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :nlp_tag, foreign_key: true, type: :uuid, index: true

      t.timestamps
    end
  end
end
