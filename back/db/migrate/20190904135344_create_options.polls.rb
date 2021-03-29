# This migration comes from polls (originally 20190904143810)
class CreateOptions < ActiveRecord::Migration[5.2]
  def change
    create_table :polls_options, id: :uuid do |t|
      t.references :question, foreign_key: {to_table: :polls_questions}, index: true, type: :uuid
      t.jsonb :title_multiloc, default: {}, null: false
      t.integer :ordering

      t.timestamps
    end
  end
end
