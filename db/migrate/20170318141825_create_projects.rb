class CreateProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :projects, id: :uuid do |t|
      t.jsonb :title_multiloc, {}
      t.jsonb :description_multiloc, {}
      t.jsonb :images
      t.jsonb :files

      t.timestamps
    end
  end
end
