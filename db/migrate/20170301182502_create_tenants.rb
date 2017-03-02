class CreateTenants < ActiveRecord::Migration[5.0]
  def change
    create_table :tenants, id: :uuid do |t|
      t.string :name
      t.string :host, index: true
      t.jsonb :features, default: []
      t.jsonb :settings, default: {}

      t.timestamps
    end
  end
end
