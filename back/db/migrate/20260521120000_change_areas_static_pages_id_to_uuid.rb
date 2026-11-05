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
#
# PostgreSQL cannot reposition a column, so swapping the id type in place would leave the
# new id as the last column - inconsistent with every other table, where id comes first.
# The table is small and unreferenced, so we rebuild it from scratch instead: a fresh
# table with id first, the rows copied over, then the old table dropped. Index and
# foreign-key names derive from the table name, so the rebuilt table reproduces them
# identically.
class ChangeAreasStaticPagesIdToUuid < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      rebuild_table do |t|
        # rubocop:disable Rails/DangerousColumnNames -- intentionally (re)defining the `id` PK
        t.primary_key :id, :uuid, default: -> { 'shared_extensions.gen_random_uuid()' }
        # rubocop:enable Rails/DangerousColumnNames
      end
    end
  end

  # Rebuilds the original bigint-id table, again with id first.
  def down
    safety_assured do
      rebuild_table do |t|
        # rubocop:disable Rails/DangerousColumnNames -- intentionally (re)defining the `id` PK
        t.primary_key :id
        # rubocop:enable Rails/DangerousColumnNames
      end
    end
  end

  private

  def rebuild_table
    # rename_table also renames the table's indexes, pkey and sequence to the _old name,
    # which frees the canonical names for the rebuilt table below.
    rename_table :areas_static_pages, :areas_static_pages_old

    create_table :areas_static_pages, id: false do |t|
      yield t
      t.references :area, index: true, foreign_key: true, type: :uuid, null: false
      t.references :static_page, index: true, foreign_key: true, type: :uuid, null: false
      t.timestamps
    end

    execute(<<~SQL.squish)
      INSERT INTO areas_static_pages (area_id, static_page_id, created_at, updated_at)
      SELECT area_id, static_page_id, created_at, updated_at FROM areas_static_pages_old
    SQL

    drop_table :areas_static_pages_old
  end
end
