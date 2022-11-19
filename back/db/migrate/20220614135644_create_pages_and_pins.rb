# frozen_string_literal: true

class CreatePagesAndPins < ActiveRecord::Migration[6.1]
  def change
    create_table :pins, id: :uuid do |t|
      t.references :admin_publication, type: :uuid, null: false, foreign_key: true
      # We don't add an index here because it's covered by the composite index below
      # See https://www.postgresql.org/docs/current/indexes-multicolumn.html for details.
      t.references :page, polymorphic: true, type: :uuid, null: false, index: false
      t.timestamps

      t.index %i[page_id admin_publication_id], unique: true
    end
  end
end
