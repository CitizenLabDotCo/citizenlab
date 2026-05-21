# frozen_string_literal: true

# areas_static_pages was created (20221111132019) without `id: :uuid`, so it received
# the Rails-default bigint primary key - the only such table in the schema; every other
# table uses a uuid id. Nothing references this id (no foreign keys, no application
# code - the associations join on area_id / static_page_id), so we replace it outright
# with a uuid to match the convention.
#
# This also removes the root cause of the tenant-template failure in TAN-7831: template
# application assigns a uuid to every model id, and a uuid string cast to this bigint
# column collapsed to a colliding integer ('cbd4...'.to_i == 0).
class ChangeAreasStaticPagesIdToUuid < ActiveRecord::Migration[7.2]
  # The table is small and unreferenced, so this brief rewrite is safe. Dropping the
  # column also drops its owned sequence. Rails has no DSL for the primary-key constraint
  # itself, so that one step stays raw SQL. Strong Migrations can't introspect these, so
  # the change is wrapped in safety_assured.
  # rubocop:disable Rails/DangerousColumnNames -- intentionally redefining the `id` PK
  def up
    safety_assured do
      remove_column :areas_static_pages, :id
      add_column :areas_static_pages, :id, :uuid,
        default: -> { 'shared_extensions.gen_random_uuid()' }, null: false
      execute 'ALTER TABLE areas_static_pages ADD PRIMARY KEY (id)'
    end
  end

  def down
    safety_assured do
      remove_column :areas_static_pages, :id
      add_column :areas_static_pages, :id, :primary_key
    end
  end
  # rubocop:enable Rails/DangerousColumnNames
end
