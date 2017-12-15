class IdeaTrendingInfo < ApplicationRecord

  belongs_to :idea

  validates :last_activity_at, presence: true
  validates :mean_last_activity_at, presence: true
  validates :idea, presence: true

  before_validation :set_actitity_ats, on: :create
  after_touch :update_info


  TREND_NUM_UPVOTES = 5
  TREND_NUM_COMMENTS = 5
  TREND_SINCE_ACTIVITY = 30 * 24 * 60 * 60 # 30 days


  def update_info
  	idea.reload
  	last_upvotes_at = idea.upvotes.where.not(user: idea.author)
                                  .order(created_at: :desc)
                                  .limit(TREND_NUM_UPVOTES)
                                  .map(&:created_at)  
    last_comments_at = idea.comments.where.not(author: idea.author)
                                    .order(created_at: :desc)
                                    .limit(TREND_NUM_COMMENTS)
                                    .map(&:created_at)                              
  	last_activity_at = [(last_upvotes_at.first || idea.published_at || Time.at(0)), 
  		                (last_comments_at.first || idea.published_at || Time.at(0))].max
    mean_last_activity_at = mean_fill_published [mean_fill_published(last_upvotes_at, n=TREND_NUM_UPVOTES), 
    	                                         mean_fill_published(last_comments_at, n=TREND_NUM_COMMENTS)]
    update_attribute(:last_activity_at, last_activity_at)
    update_attribute(:mean_last_activity_at, mean_last_activity_at)
  end


  private

  def mean_fill_published ats, n=nil
  	unless n
  		n = ats.size
  	end
  	ats = ats.take n
  	frac = (ats.size / n.to_f)
  	Time.at(frac * mean(ats.map(&:to_i)) + (1 - frac) * idea.published_at.to_i || 0)
  end

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end

  def set_actitity_ats
  	self.last_activity_at ||= (idea.published_at || Time.at(0))
  	self.mean_last_activity_at ||= (idea.published_at || Time.at(0))
  end

end
