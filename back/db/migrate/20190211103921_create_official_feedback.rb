class CreateOfficialFeedback < ActiveRecord::Migration[5.2]
  def change
    create_table :official_feedbacks, id: :uuid do |t|
      t.jsonb :body_multiloc, default: {}
      t.jsonb :author_multiloc, default: {}

      t.references :user, foreign_key: true, type: :uuid
      t.references :idea, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
