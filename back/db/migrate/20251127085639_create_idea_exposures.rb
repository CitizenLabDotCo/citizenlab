class CreateIdeaExposures < ActiveRecord::Migration[7.2]
  def change
    create_table :idea_exposures, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :idea, null: false, foreign_key: true, type: :uuid
      t.references :phase, null: false, foreign_key: true, type: :uuid, comment: 'This is the phase during which the idea is exposed to the user, stored redundantly for faster querying.'

      t.timestamps
    end
  end
end
