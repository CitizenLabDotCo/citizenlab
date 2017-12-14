class CreateIdeaTrendingInfos < ActiveRecord::Migration[5.1]
  def change
    create_table :idea_trending_infos, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, null: false
      t.datetime :last_activity_at, null: false
      t.datetime :mean_last_activity_at, null: false
    end

    Idea.all.each{ |i| IdeaTrendingInfo.create(idea: i) }
  end
end
