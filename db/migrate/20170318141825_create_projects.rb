class CreateProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :projects, id: :uuid do |t|
      t.jsonb :title_multiloc, {}
      t.jsonb :description_multiloc, {}
      t.jsonb :images, default: []
      t.string :slug

      t.timestamps
    end
  end
end
