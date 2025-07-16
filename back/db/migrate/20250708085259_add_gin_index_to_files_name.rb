# frozen_string_literal: true

# Add a GIN index on filenames to make trigram and ilike queries faster.
class AddGinIndexToFilesName < ActiveRecord::Migration[7.1]
  def change
    add_index :files, :name, using: :gin, opclass: :gin_trgm_ops, name: 'index_files_on_name_gin_trgm'
  end
end
