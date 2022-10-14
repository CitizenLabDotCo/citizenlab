# frozen_string_literal: true

class AddAdminPublicationIndexes < ActiveRecord::Migration[6.1]
  def change
    add_index(:admin_publications, %i[publication_type publication_id])
  end
end
