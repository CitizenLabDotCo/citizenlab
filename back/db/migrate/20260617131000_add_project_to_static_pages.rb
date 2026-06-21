# frozen_string_literal: true

class AddProjectToStaticPages < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_reference :static_pages, :project, type: :uuid, null: true, index: true, foreign_key: true
    end
  end
end
