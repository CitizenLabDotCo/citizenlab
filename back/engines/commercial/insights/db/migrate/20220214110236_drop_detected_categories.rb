class DropDetectedCategories < ActiveRecord::Migration[6.1]
  def change
    drop_table 'insights_detected_categories', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string 'name', null: false
      t.uuid 'view_id', null: false
      t.datetime 'created_at', precision: 6, null: false
      t.datetime 'updated_at', precision: 6, null: false
      t.index %w[view_id name], name: 'index_insights_detected_categories_on_view_id_and_name', unique: true
      t.index ['view_id'], name: 'index_insights_detected_categories_on_view_id'
    end
  end
end
