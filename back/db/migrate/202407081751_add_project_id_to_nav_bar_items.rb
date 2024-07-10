# frozen_string_literal: true

class AddProjectIdToNavBarItems < ActiveRecord::Migration[5.1]
    def change
      add_reference :nav_bar_items, :project, foreign_key: true, type: :uuid, null: true
    end
  end
  