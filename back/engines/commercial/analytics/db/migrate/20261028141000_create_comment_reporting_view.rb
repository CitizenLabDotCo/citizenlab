# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateCommentReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_comments, version: 1
  end
end
