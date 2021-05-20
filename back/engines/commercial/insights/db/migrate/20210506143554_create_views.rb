class CreateViews < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_views, id: :uuid do |t|
      t.string :name, null: false, index: true
      t.references :scope, type: :uuid, null: false, index: false, foreign_key: { to_table: :projects }

      t.timestamps
    end
  end
end
