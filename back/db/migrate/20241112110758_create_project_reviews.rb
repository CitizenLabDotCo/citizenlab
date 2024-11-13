# frozen_string_literal: true

class CreateProjectReviews < ActiveRecord::Migration[7.0]
  def change
    create_table :project_reviews, id: :uuid do |t|
      t.references :project, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.references :requester, type: :uuid, foreign_key: { to_table: :users }
      t.references :reviewer, type: :uuid, foreign_key: { to_table: :users }
      t.datetime :approved_at

      t.timestamps
    end
  end
end
