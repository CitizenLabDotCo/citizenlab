# frozen_string_literal: true

class AddDescriptionTsvectorToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :tsvector, :tsvector, as: <<~SQL.squish, stored: true
      setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(description_multiloc::text, '')), 'B')
    SQL

    add_index :files, :tsvector, using: :gin # for tsearch
    add_index :files, '(description_multiloc::text) gin_trgm_ops', using: :gin # for trigram search
  end
end
