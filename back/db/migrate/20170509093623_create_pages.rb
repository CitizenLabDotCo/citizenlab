class CreatePages < ActiveRecord::Migration[5.0]
  def change
    create_table :pages, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}
      t.jsonb :body_multiloc, default: {}
      t.string :slug, index: true

      t.timestamps
    end
  end
end
