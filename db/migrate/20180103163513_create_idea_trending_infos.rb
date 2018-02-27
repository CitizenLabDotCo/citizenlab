class CreateIdeaTrendingInfos < ActiveRecord::Migration[5.1]
  def change
    create_view :idea_trending_infos
  end
end
