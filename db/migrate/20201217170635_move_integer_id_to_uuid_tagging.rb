class MoveIntegerIdToUuidTagging < ActiveRecord::Migration[6.0]
  def change
    add_column :tagging_taggings, :uuid, :uuid, default: "gen_random_uuid()", null: false

    change_table :tagging_taggings do |t|
      t.remove :id
      t.rename :uuid, :id
    end
    execute "ALTER TABLE tagging_taggings ADD PRIMARY KEY (id);"
  end
end
