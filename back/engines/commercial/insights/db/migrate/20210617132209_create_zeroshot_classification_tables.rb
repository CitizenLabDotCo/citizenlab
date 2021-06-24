# frozen_string_literal: true

class CreateZeroshotClassificationTables < ActiveRecord::Migration[6.0]
  def change
    create_tasks_table
    create_tasks_inputs_table
    create_tasks_categories_table
  end

  private

  def create_tasks_table
    create_table :insights_zeroshot_classification_tasks, id: :uuid do |t|
      t.string :task_id, index: { unique: true }, null: false

      t.timestamps
    end
  end

  def create_tasks_categories_table
    # rubocop:disable Rails/CreateTableWithTimestamps
    create_table :insights_zeroshot_classification_tasks_categories, id: false do |t|
      t.references(:category, type: :uuid, null: false,
        foreign_key: { to_table: :insights_categories },
        index: { name: :index_insights_zsc_tasks_categories_on_category_id })

      t.references(:task, type: :uuid, null: false,
        foreign_key: { to_table: :insights_zeroshot_classification_tasks },
        index: { name: :index_insights_zsc_tasks_categories_on_task_id }
      )

      t.index %i[category_id task_id], unique: true, name: 'index_insights_zsc_tasks_categories_on_category_id_and_task_id'
    end
    # rubocop:enable Rails/CreateTableWithTimestamps
  end

  def create_tasks_inputs_table
    # rubocop:disable Rails/CreateTableWithTimestamps
    create_table :insights_zeroshot_classification_tasks_inputs, id: :uuid do |t|
      t.references :task,type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_zeroshot_classification_tasks }

      t.references(:input, type: :uuid, null: false, polymorphic: true,
        index: { name: :index_insights_zsc_tasks_inputs_on_input }
      )

      t.index %i[input_id input_type task_id], unique: true, name: 'index_insights_zsc_tasks_inputs_on_input_and_task_id'
    end
    # rubocop:enable Rails/CreateTableWithTimestamps
  end
end
