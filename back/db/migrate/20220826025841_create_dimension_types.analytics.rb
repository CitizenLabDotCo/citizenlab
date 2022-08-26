# frozen_string_literal: true

# This migration comes from analytics (originally 20220624100204)

class CreateDimensionTypes < ActiveRecord::Migration[6.1]
  def up
    # rubocop:disable Rails/CreateTableWithTimestamps
    create_table :analytics_dimension_types, id: :uuid do |t|
      t.string :name
      t.string :parent
    end
    # rubocop:enable Rails/CreateTableWithTimestamps

    # Insert the different types
    execute("
      INSERT INTO analytics_dimension_types (name, parent)
      VALUES
        ('idea', 'post'),
        ('initiative', 'post'),
        ('comment', null),
        ('vote', null);
    ")
  end

  def down
    drop_table :analytics_dimension_types
  end
end
