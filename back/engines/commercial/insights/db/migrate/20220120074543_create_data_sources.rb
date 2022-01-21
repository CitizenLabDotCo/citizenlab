class CreateDataSources < ActiveRecord::Migration[6.1]
  # The scope of Insights analyses is broadened to be able to support inputs from multiple data
  # sources. The +scope_id+ attribute/column of views (that references a Project) is now
  # replaced by an +has_many+ association to the +data_sources+ table.
  def change
    create_table :insights_data_sources, id: :uuid do |t|
      t.references :view, type: :uuid, index: true, null: false
      t.references :origin, type: :uuid, polymorphic: true, index: false, null: false

      t.index %i[view_id origin_type origin_id], unique: true, name: 'index_insights_data_sources_on_view_and_origin'
      t.foreign_key :insights_views, column: :view_id

      t.timestamps
    end

    # Data migration: view scopes are converted into data sources.
    reversible do |dir|
      dir.up do
        select_all('SELECT * FROM insights_views').each do |view|
          insert_query = <<~SQL
            INSERT INTO insights_data_sources (view_id, origin_type, origin_id, created_at, updated_at)
            VALUES ('#{view['id']}', 'Project', '#{view['scope_id']}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          SQL

          execute(insert_query)
        end
      end

      dir.down do
        select_all('SELECT * FROM insights_data_sources').each do |data_source|
          update_query = <<~SQL
            UPDATE insights_views
            SET scope_id = '#{data_source['origin_id']}'
            WHERE id = '#{data_source['view_id']}'
          SQL

          execute(update_query)
        end

        # The not-null constraint for scope_id is only restored after the data migration.
        change_column_null :insights_views, :scope_id, false
      end
    end

    remove_reference :insights_views, :scope, type: :uuid, null: true, index: false, foreign_key: { to_table: :projects }
  end
end

