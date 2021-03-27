class CreateEmailSnippets < ActiveRecord::Migration[5.0]
  def change
    create_table :email_snippets, id: :uuid do |t|
      t.string :email
      t.string :snippet
      t.string :locale
      t.text :body

      t.timestamps
    end
    add_index :email_snippets, [:email, :snippet, :locale]
  end
end
