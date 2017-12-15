class TrendingIdeaService

  def filter_trending ideas=Idea.all
    ideas.includes(:idea_status)
         .includes(:idea_trending_info)
         .where.not('idea_statuses.code' => 'rejected')
         .where.not('(ideas.upvotes_count - ideas.downvotes_count) < 0')
         .where("idea_trending_infos.last_activity_at >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}'")
  end

  def sort_trending ideas=Idea.all
    #filter_trending_sql = "SELECT ideas.* 
    #                       FROM ideas 
    #                       LEFT OUTER JOIN idea_statuses ON idea_statuses.id = ideas.idea_status_id 
    #                       LEFT OUTER JOIN comments ON comments.idea_id = ideas.id 
    #                       LEFT OUTER JOIN votes ON votes.votable_id = ideas.id AND votes.votable_type = 'Idea' 
    #                       WHERE (NOT ((ideas.upvotes_count - ideas.downvotes_count) < 0)) 
    #                         AND (idea_statuses.code != 'rejected')
    #                         AND (NOT (comments.author_id = ideas.author_id)) 
    #                         AND votes.mode = 'up' 
    #                         AND (NOT (votes.user_id = ideas.author_id)) 
    #                       GROUP BY ideas.id 
    #                       HAVING (coalesce(MAX(comments.created_at) , ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}') 
    #                           OR (coalesce(MAX(votes.created_at) , ideas.published_at) >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}')"

    filter_trending_sql = "SELECT ideas.*
                           FROM ideas 
                           LEFT OUTER JOIN idea_statuses ON idea_statuses.id = ideas.idea_status_id 
                           LEFT OUTER JOIN idea_trending_infos ON idea_trending_infos.idea_id = ideas.id 
                           WHERE (idea_statuses.code != 'rejected') 
                           AND (NOT ((ideas.upvotes_count - ideas.downvotes_count) < 0)) 
                           AND (idea_trending_infos.last_activity_at >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}')"

    #comments_ago_sql = "SELECT id,
    #                           round((count(comment_id) / #{IdeaTrendingInfo::TREND_NUM_COMMENTS.to_f}) * GREATEST(avg(extract(epoch from comment_ago)),extract(epoch from published_at))) 
    #                           + round(((#{IdeaTrendingInfo::TREND_NUM_COMMENTS.to_i} - count(comment_id)) / #{IdeaTrendingInfo::TREND_NUM_COMMENTS.to_f}) * extract(epoch from published_at)) AS comment_ago
    #                    FROM ideas i
    #                    LEFT OUTER JOIN LATERAL (SELECT id AS comment_id, idea_id, created_at AS comment_ago 
    #                                             FROM comments 
    #                                             WHERE comments.idea_id = i.id AND NOT comments.author_id = i.author_id 
    #                                             ORDER BY created_at DESC LIMIT #{IdeaTrendingInfo::TREND_NUM_COMMENTS.to_i}) AS whateva ON idea_id = id
    #                    GROUP BY id"

    #votes_ago_sql = "SELECT id,
    #                        round((count(vote_id) / #{IdeaTrendingInfo::TREND_NUM_UPVOTES.to_f}) * GREATEST(avg(extract(epoch from vote_ago)),extract(epoch from published_at))) 
    #                        + round(((#{IdeaTrendingInfo::TREND_NUM_UPVOTES.to_i} - count(vote_id)) / #{IdeaTrendingInfo::TREND_NUM_UPVOTES.to_f}) * extract(epoch from published_at)) AS vote_ago
    #                 FROM ideas i
    #                 LEFT OUTER JOIN LATERAL (SELECT id AS vote_id, votable_id, created_at AS vote_ago 
    #                                          FROM votes 
    #                                          WHERE votes.votable_type = 'Idea' AND votes.votable_id = i.id AND votes.mode = 'up' AND NOT votes.user_id = i.author_id 
    #                                          ORDER BY created_at DESC LIMIT #{IdeaTrendingInfo::TREND_NUM_UPVOTES.to_i}) AS whateva ON votable_id = id
    #                 GROUP BY id"

    # filter_trending_sql = filter_trending(Idea.all.unscoped).to_sql
    # byebug

    ideas.joins("LEFT OUTER JOIN (SELECT whaatevaa.id AS is_trending_b FROM (#{filter_trending_sql}) AS whaatevaa) AS whateva ON is_trending_b = ideas.id") # .joins("LEFT OUTER JOIN (SELECT ideas.id AS is_trending_b FROM (#{filter_trending_sql}) AS whateva ON is_trending_b = ideas.id") # .joins("LEFT OUTER JOIN (SELECT ideas.id AS is_trending_b FROM ideas WHERE NOT (ideas.upvotes_count - ideas.downvotes_count) < 10) AS whateva ON is_trending_b = ideas.id")
         .group('ideas.id, idea_trending_infos.id')
         .select('ideas.*, count(is_trending_b) AS is_trending')
         .left_outer_joins(:idea_trending_info)
         .select("ideas.*, (GREATEST(((ideas.upvotes_count - ideas.downvotes_count) + 1), 1) / (#{Time.now.to_i} - extract(epoch from idea_trending_infos.mean_last_activity_at))) AS score")# .select('*, (GREATEST(((ideas.upvotes_count - ideas.downvotes_count) + 1), 1) / (comment_ago + vote_ago)) AS score')
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


  def trending_score idea
    # used for testing purposes
    upvotes_ago = activity_ago idea, 
                               idea.upvotes.select { |v| idea.author && v.user && (v.user.id == idea.author.id) }, 
                               IdeaTrendingInfo::TREND_NUM_UPVOTES
    comments_ago = activity_ago idea, 
                                idea.comments.select { |c| idea.author && c.author && (c.author.id == idea.author.id) }, 
                                IdeaTrendingInfo::TREND_NUM_COMMENTS
    score = trending_score_formula (idea.upvotes_count - idea.downvotes_count), upvotes_ago, comments_ago
    if (idea.upvotes_count - idea.downvotes_count) < 0
      return -1 / score
    end
    if idea.idea_status.code == 'rejected'
      return -1 / score
    end
    if [upvotes_ago.first, comments_ago.first].max > IdeaTrendingInfo::TREND_SINCE_ACTIVITY
      return -1 / score
    end
    score
  end

  def trending? idea
    # used for testing purposes
    trending_score(idea) >= 0
  end


  private

  def trending_score_formula votes_diff, upvotes_ago, comments_ago
    [(1 + votes_diff), 1].max / mean([mean(upvotes_ago), mean(comments_ago)])
  end

  def activity_ago idea, iteratables, n
    take_and_fill iteratables.map{ |obj| Time.now.to_i - obj.created_at.to_i }.sort,
                  n, 
                  (Time.now.to_i - idea.published_at.to_i)
  end

  def take_and_fill arr, n, default
    taken = arr.take n
    fill = Array.new (n - taken.size), default
    taken.concat fill
  end

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end

end