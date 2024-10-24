# frozen_string_literal: true

class AddPreviewTokenToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :preview_token, :string, default: -> { 'gen_random_uuid()' }, null: false

    ActiveRecord::Base.connection.execute(<<~SQL.squish)
      UPDATE projects
      SET preview_token = gen_random_uuid()
      WHERE preview_token IS NULL
    SQL
  end
end
