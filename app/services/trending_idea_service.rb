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
                 .left_outer_joins(:comments).group('ideas.id, projects.id, users.id, topics.id, areas.id, idea_images.id, idea_statuses.id')
                 .where.not('comments.author_id = ideas.author_id')
                 .having("GREATEST(MAX(comments.created_at) , ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 .left_outer_joins(:votes).group('ideas.id, projects.id, users.id, topics.id, areas.id, idea_images.id, idea_statuses.id')
                 .where('votes.mode' => 'up').where.not('votes.user_id = ideas.author_id')
                 .having("GREATEST(MAX(votes.created_at) , ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 # .left_outer_joins(:comments).distinct.select('idea_id, MAX(created_at) AS comment_created_at_min').group('idea_id') # .left_outer_joins('SELECT MAX(created_at) as comment_created_at_min, idea_id FROM comments GROUP BY idea_id')
                 # .where("GREATEST(comment_created_at_min, ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 # .group('comments.idea_id').having("coalesce(MAX(comments.created_at),ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - TREND_SINCE_ACTIVITY)}'")
                 # ([@upvotes_ago[idea.id].first, @comments_ago[idea.id].first].min > TREND_SINCE_ACTIVITY))

    ideas
    
    # cache_state(ideas) if !(@upvotes_ago && @comments_ago && @are_trending)
    # ideas.select { |i| @are_trending[i.id] }
  end

  def sort_trending ideas=Idea.all
    filter_trending_sql = "SELECT ideas.* 
                           FROM ideas 
                           LEFT OUTER JOIN idea_statuses ON idea_statuses.id = ideas.idea_status_id 
                           LEFT OUTER JOIN comments ON comments.idea_id = ideas.id 
                           LEFT OUTER JOIN votes ON votes.votable_id = ideas.id AND votes.votable_type = 'Idea' 
                           WHERE (NOT ((ideas.upvotes_count - ideas.downvotes_count) < 0)) 
                             AND (idea_statuses.code != 'rejected')
                             AND (NOT (comments.author_id = ideas.author_id)) 
                             AND votes.mode = 'up' 
                             AND (NOT (votes.user_id = ideas.author_id)) 
                           GROUP BY ideas.id 
                           HAVING (GREATEST(MAX(comments.created_at) , ideas.published_at) >= timestamp '2017-09-02 15:34:25 +0000') 
                              AND (GREATEST(MAX(votes.created_at) , ideas.published_at) >= timestamp '2017-09-02 15:34:25 +0000')"

    comments_ago_sql = "SELECT id,
                               round((count(comment_id) / 5.0) * GREATEST(avg(extract(epoch from comment_ago)),extract(epoch from published_at))) 
                               + round(((5 - count(comment_id)) / 5.0) * extract(epoch from published_at)) AS comment_ago
                        FROM ideas i
                        LEFT OUTER JOIN LATERAL (SELECT id AS comment_id, idea_id, created_at AS comment_ago 
                                                 FROM comments 
                                                 WHERE comments.idea_id = i.id AND NOT comments.author_id = i.author_id 
                                                 ORDER BY created_at DESC LIMIT 5) AS whateva ON idea_id = id
                        GROUP BY id"

    ideas.unscoped ### TERRIBLE
         .joins("LEFT OUTER JOIN (SELECT whaatevaa.id AS is_trending_b FROM (#{filter_trending_sql}) AS whaatevaa) AS whateva ON is_trending_b = ideas.id") # .joins("LEFT OUTER JOIN (SELECT ideas.id AS is_trending_b FROM (#{filter_trending_sql}) AS whateva ON is_trending_b = ideas.id") # .joins("LEFT OUTER JOIN (SELECT ideas.id AS is_trending_b FROM ideas WHERE NOT (ideas.upvotes_count - ideas.downvotes_count) < 10) AS whateva ON is_trending_b = ideas.id")
         .group('ideas.id')
         .select('ideas.*, count(is_trending_b) AS is_trending')
         .joins("LEFT OUTER JOIN (#{comments_ago_sql}) AS whaaatevaaa ON whaaatevaaa.id = ideas.id")
         .group('ideas.id')
         .select('*, ((ideas.upvotes_count - ideas.downvotes_count) / comment_ago) AS score')
         .order('is_trending DESC, score DESC')
         # .joins("LEFT OUTER JOIN (SELECT ideas.id AS sub_is_trending FROM (#{filter_trending(ideas).to_sql}) AS idontcare) AS whateva ON ideas.id = whateva.sub_is_trending")
         # .group('ideas.id')
         # .select('ideas.*, count(sub_is_trending) AS is_trending, (ideas.upvotes_count - ideas.downvotes_count) AS score')
         # .order('is_trending DESC, score DESC')
         # .joins('LEFT OUTER JOIN comments ON comments.idea_id = ideas.id')
         # .where.not('comments.author_id = ideas.author_id') # 
         # .group('ideas.id')
         # .select('ideas.*, count(comments.id) AS num_coms')
         



    # subquery = "SELECT ideas.*, (ideas.downvotes_count < 2) AS is_trending, ideas.upvotes_count AS score FROM #{ideas.to_sql} ORDER is_trending DESC, score DESC"
    # ideas.select("*").from(Arel.sql("(#{subquery}) as t"))



    # ideas.left_outer_joins(ideas.select('ideas.id, (ideas.upvotes_count > 2) AS is_trending, ideas.upvotes_count AS score')).order('is_trending DESC, score DESC')

    # trending_ids = filter_trending(ideas).map(&:id)
    # trending = ideas.where(id: trending_ids)
    # not_trending = ideas.where.not(id: trending_ids)

    #cache_state(ideas) if !(@upvotes_ago && @comments_ago && @are_trending)
    #ideas.sort_by do |i|
    #  score = trending_score_formula (i.upvotes_count - i.downvotes_count), @upvotes_ago[i.id], @comments_ago[i.id]
    #  if @are_trending[i.id]
    #    score
    #  else
    #    -1 / score
    #  end
    #end.reverse 
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