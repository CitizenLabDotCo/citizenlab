class CreateClusterings < ActiveRecord::Migration[5.1]
  def change
    return if table_exists?(:clusterings)

    create_table :clusterings, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}
      t.jsonb :structure, default: {}

      t.timestamps
    end
  end
end
