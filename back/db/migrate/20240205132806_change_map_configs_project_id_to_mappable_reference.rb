class ChangeMapConfigsProjectIdToMappableReference < ActiveRecord::Migration[7.0]
  # rubocop:disable Rails/ApplicationRecord
  class StubMapsMapConfig < ActiveRecord::Base
    self.table_name = 'maps_map_configs'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    add_reference :maps_map_configs, :mappable, polymorphic: true, type: :uuid, index: true
    change_column_null :maps_map_configs, :project_id, true # allow nulls

    reversible do |dir|
      dir.up do
        StubMapsMapConfig.update_all(mappable_type: 'Project')
        StubMapsMapConfig.update_all('mappable_id = project_id')
      end

      dir.down do
        StubMapsMapConfig.update_all('project_id = mappable_id')
      end
    end

    remove_column :maps_map_configs, :project_id, :uuid
    change_column_null :maps_map_configs, :mappable_type, false # disallow nulls
    change_column_null :maps_map_configs, :mappable_id, false # disallow nulls
  end
end
