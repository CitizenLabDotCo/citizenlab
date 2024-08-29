# frozen_string_literal: true

class AddOnlineLinkToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :online_link, :string
  end
end
