# frozen_string_literal: true

class RemoveBodyMultilocFromStaticPages < ActiveRecord::Migration[6.1]
  def change
    remove_column :static_pages, :body_multiloc, :jsonb, default: {}
  end
end
