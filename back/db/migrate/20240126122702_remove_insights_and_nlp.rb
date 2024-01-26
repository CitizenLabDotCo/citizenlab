class RemoveInsightsAndNLP < ActiveRecord::Migration[7.0]
  def change
    drop_table 'insights_data_sources', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references :view, type: :uuid, index: true, null: false
      t.references :origin, type: :uuid, polymorphic: true, index: true, null: false

      t.index %i[view_id origin_type origin_id], unique: true, name: 'index_insights_data_sources_on_view_and_origin'
      t.foreign_key :insights_views, column: :view_id

      t.timestamps
    end
    drop_table 'insights_text_networks', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.string :language, index: true, null: false
      t.jsonb :json_network, null: false

      t.timestamps

      t.index %i[view_id language], unique: true
    end
    drop_table 'insights_text_network_analysis_tasks_views', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references :task, type: :uuid, null: false, index: true, foreign_key: { to_table: :nlp_text_network_analysis_tasks }
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.string :language, null: false

      t.timestamps
    end
    drop_table 'insights_processed_flags', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references(:input, type: :uuid, null: false, polymorphic: true,
        index: { name: :index_processed_flags_on_input })
      t.references(:view, type: :uuid, null: false)

      t.index %i[input_id input_type view_id], unique: true, name: 'index_single_processed_flags'
      t.timestamps
    end
    drop_table 'insights_zeroshot_classification_tasks_inputs', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references :task, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_zeroshot_classification_tasks }

      t.references(:input, type: :uuid, null: false, polymorphic: true,
        index: { name: :index_insights_zsc_tasks_inputs_on_input })

      t.index %i[input_id input_type task_id], unique: true, name: 'index_insights_zsc_tasks_inputs_on_input_and_task_id'
    end
    drop_table 'insights_zeroshot_classification_tasks_categories', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references(:category, type: :uuid, null: false,
        foreign_key: { to_table: :insights_categories },
        index: { name: :index_insights_zsc_tasks_categories_on_category_id })

      t.references(:task, type: :uuid, null: false,
        foreign_key: { to_table: :insights_zeroshot_classification_tasks },
        index: { name: :index_insights_zsc_tasks_categories_on_task_id })

      t.index %i[category_id task_id], unique: true, name: 'index_insights_zsc_tasks_categories_on_category_id_and_task_id'
    end
    drop_table 'insights_zeroshot_classification_tasks', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string :task_id, index: { unique: true }, null: false

      t.timestamps
    end
    drop_table 'insights_category_assignments', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.references :category, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_categories }
      t.references :input, type: :uuid, null: false, index: true, polymorphic: true
      t.boolean :approved, null: false, index: true, default: true

      t.timestamps

      t.index %i[category_id input_id input_type], unique: true, name: 'index_single_category_assignment'
    end
    drop_table 'insights_categories', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string :name, null: false
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.integer :position
      t.integer :inputs_count, null: false, default: 0
      t.references :source, polymorphic: true, type: :uuid, index: true

      t.timestamps

      t.index %i[view_id name], unique: true
      t.index [:source_type]
    end
    drop_table 'insights_views', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string :name, null: false, index: true

      t.timestamps
    end
    drop_table 'nlp_text_network_analysis_tasks', id: :uuid, default: -> { 'gen_random_uuid()' }, force: :cascade do |t|
      t.string :task_id, index: { unique: true }, null: false
      t.string :handler_class, null: false

      t.timestamps
    end
  end
end
