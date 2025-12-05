class CreateWiseVoiceFlags < ActiveRecord::Migration[7.2]
  def change
    create_table :wise_voice_flags, id: :uuid do |t|
      t.references :flaggable, polymorphic: true, null: false, type: :uuid, index: true
      t.jsonb :role_multiloc, null: false, default: {}
      t.jsonb :quotes, null: false, default: []

      t.timestamps
    end
  end
end
