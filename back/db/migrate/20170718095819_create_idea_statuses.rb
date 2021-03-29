class CreateIdeaStatuses < ActiveRecord::Migration[5.1]
  def change
    create_table :idea_statuses, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.integer :ordering
      t.string :code
      t.string :color

      t.timestamps
    end
  end
end
