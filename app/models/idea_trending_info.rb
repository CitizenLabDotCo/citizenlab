class IdeaTrendingInfo < ApplicationRecord

  TREND_NUM_UPVOTES = 5
  TREND_NUM_COMMENTS = 5
  TREND_SINCE_ACTIVITY = 30 * 24 * 60 * 60 # 30 days


  belongs_to :idea

  validates :last_activity_at, presence: true
  validates :mean_activity_at, presence: true
  validates :idea, presence: true


  def readonly?
    true
  end

end
