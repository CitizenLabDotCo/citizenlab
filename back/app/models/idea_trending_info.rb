# == Schema Information
#
# Table name: idea_trending_infos
#
#  idea_id          :uuid
#  last_activity_at :datetime
#  mean_activity_at :datetime
#
class IdeaTrendingInfo < ApplicationRecord

  TREND_SINCE_ACTIVITY = 30 * 24 * 60 * 60 # 30 days


  belongs_to :idea

  validates :last_activity_at, presence: true
  validates :mean_activity_at, presence: true
  validates :idea, presence: true


  def readonly?
    true
  end

end
