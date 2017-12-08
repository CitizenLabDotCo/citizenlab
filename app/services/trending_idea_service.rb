class TrendingIdeaService
  # Care should be taken whilst using this service
  # as some shared state is kept for efficient use
  # of the service's methods.

  TREND_NUM_UPVOTES = 5
  TREND_NUM_COMMENTS = 5
  TREND_SINCE_ACTIVITY = 100 * 24 * 60 * 60 # 100 days

  def initialize
    @upvotes_ago = nil
    @comments_ago = nil
    @are_trending = nil
  end


  def filter_trending ideas=Idea.all
    # byebug
    ideas = ideas.includes(:idea_status)
    ideas = ideas.where.not('idea_statuses.code' => 'rejected')
                 .where.not('(ideas.upvotes_count - ideas.downvotes_count) < 0')
                 .left_outer_joins(:comments).distinct.select('idea_id, MAX(created_at) AS comment_created_at_min').group('idea_id') # .left_outer_joins('SELECT MAX(created_at) as comment_created_at_min, idea_id FROM comments GROUP BY idea_id')
                 .where("GREATEST(comment_created_at_min, ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 # .group('comments.idea_id').having("coalesce(MAX(comments.created_at),ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 # ([@upvotes_ago[idea.id].first, @comments_ago[idea.id].first].min > TREND_SINCE_ACTIVITY))

    ideas
    
    # cache_state(ideas) if !(@upvotes_ago && @comments_ago && @are_trending)
    # ideas.select { |i| @are_trending[i.id] }
  end

  def sort_trending ideas=Idea.all
    cache_state(ideas) if !(@upvotes_ago && @comments_ago && @are_trending)
    ideas.sort_by do |i|
      score = trending_score_formula (i.upvotes_count - i.downvotes_count), @upvotes_ago[i.id], @comments_ago[i.id]
      if @are_trending[i.id]
        score
      else
        -1 / score
      end
    end.reverse 
  end


  private

  def cache_state ideas
    @upvotes_ago = {}
    @comments_ago = {}
    @are_trending = {}
    ideas.each do |i|
      default_ago = Time.now.to_i - i.published_at.to_i
      @upvotes_ago[i.id] = activity_ago i.upvotes, # .select { |v| i.author && v.user && (v.user.id == i.author.id) }, 
                                        TREND_NUM_UPVOTES, default_ago
      @comments_ago[i.id] = activity_ago i.comments, # .select { |c| i.author && c.author && (c.author.id == i.author.id) }, 
                                         TREND_NUM_COMMENTS, default_ago
      @are_trending[i.id] = trending? i
    end
  end

  def activity_ago iteratables, default_ago, n
    take_and_fill iteratables.map{ |obj| Time.now.to_i - obj.created_at.to_i }.sort,
                  n, 
                  default_ago
  end

  def take_and_fill arr, n, default
    taken = arr.take n
    fill = Array.new (n - taken.size), default
    taken.concat fill
  end


  def trending? idea
    !(((idea.upvotes_count - idea.downvotes_count) < 0) || 
      (idea.idea_status.code == 'rejected') || 
      ([@upvotes_ago[idea.id].first, @comments_ago[idea.id].first].min > TREND_SINCE_ACTIVITY))
  end


  def trending_score_formula votes_diff, upvotes_ago, comments_ago
    [(1 + votes_diff), 1].max / (mean(upvotes_ago) + mean(comments_ago))
  end

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end

end