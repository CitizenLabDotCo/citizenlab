class CreatePhaseMethods < ActiveRecord::Migration[6.0]
  def change
    create_table :phase_methods, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.uuid :phase_id, null: false
      t.string :method_type, null: false # 'ideation', 'survey', 'voting', etc
      t.datetime :start_at
      t.datetime :end_at
      t.timestamps
    end

    add_index :phase_methods, :phase_id
    add_index :phase_methods, [:phase_id, :method_type]
    safety_assured { add_foreign_key :phase_methods, :phases }

    # Backfill: one PhaseMethod per existing phase based on phases.participation_method
    reversible do |dir|
      dir.up do
        safety_assured do
          execute <<-SQL
            INSERT INTO phase_methods (id, phase_id, method_type, start_at, end_at, created_at, updated_at)
            SELECT gen_random_uuid(), phases.id, phases.participation_method, phases.start_at, phases.end_at, NOW(), NOW()
            FROM phases
            WHERE phases.participation_method IS NOT NULL
          SQL
        end
      end
    end
  end
end
