# frozen_string_literal: true

class AddListedToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :listed, :boolean, default: true, null: false
  end
end
