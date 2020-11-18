class CreateConfigurations < ActiveRecord::Migration[6.0]
  def change
    create_table :configurations, id: :uuid do |t|
      t.string :logo
      t.string :header_bg
      t.string :favicon
      t.jsonb :settings, default: {}
      t.jsonb :style, default: {}
      t.timestamps
    end
  end
end
