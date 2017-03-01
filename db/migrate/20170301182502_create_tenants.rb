class CreateTenants < ActiveRecord::Migration[5.0]
  def change
    create_table :tenants, id: :uuid do |t|
      t.string :name
      t.string :host
      t.jsonb :features
      t.jsonb :settings

      t.timestamps
    end
  end
end
