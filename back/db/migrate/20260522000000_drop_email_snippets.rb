# frozen_string_literal: true
class DropEmailSnippets < ActiveRecord::Migration[7.1]
  def up
    drop_table :email_snippets
  end

  def down
    create_table :email_snippets, id: :uuid do |t|
      t.string :email
      t.string :snippet
      t.string :locale
      t.text :body

      t.timestamps
    end
    add_index :email_snippets, %i[email snippet locale]
  end
end
