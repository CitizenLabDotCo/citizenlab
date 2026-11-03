# frozen_string_literal: true

# This migration comes from content_builder (originally 20261103170000)
class AddQueryScopeToContentBuilderQuerySnapshots < ActiveRecord::Migration[7.2]
  def change
    # The rows the answer was read from (McpServer::QueryScope#to_stamp). Every
    # snapshot so far was made by an admin, so 'all' is right for the existing ones.
    add_column :content_builder_query_snapshots, :query_scope, :jsonb, null: false, default: 'all'
  end
end
