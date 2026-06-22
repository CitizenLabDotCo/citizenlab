# frozen_string_literal: true

class AddTitleMultilocToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :title_multiloc, :jsonb, default: {}
  end
end
