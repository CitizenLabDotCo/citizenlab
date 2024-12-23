# frozen_string_literal: true

class AddPreviewTokenToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :preview_token, :string

    ActiveRecord::Base.connection.execute(<<~SQL.squish)
      UPDATE projects
      SET preview_token = MD5(RANDOM()::TEXT) || MD5(RANDOM()::TEXT)
      WHERE preview_token IS NULL
    SQL

    # The default value is handled in the Rails model.
    change_column_null :projects, :preview_token, false
  end
end
