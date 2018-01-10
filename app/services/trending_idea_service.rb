class TrendingIdeaService

  def filter_trending ideas=Idea.all
    ideas.includes(:idea_status)
         .includes(:idea_trending_info)
         .where.not('idea_statuses.code' => 'rejected')
         .where.not('(ideas.upvotes_count - ideas.downvotes_count) < 0')
         .where("ideas.created_at >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}'")
  end

  def sort_trending ideas=Idea.all
    filter_trending_sql = "SELECT ideas.*
                           FROM ideas 
                           LEFT OUTER JOIN idea_statuses ON idea_statuses.id = ideas.idea_status_id 
                           LEFT OUTER JOIN idea_trending_infos ON idea_trending_infos.idea_id = ideas.id 
                           WHERE (idea_statuses.code != 'rejected') 
                           AND (NOT ((ideas.upvotes_count - ideas.downvotes_count) < 0)) 
                           AND (ideas.created_at >= timestamp '#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}')"

    ideas.joins("LEFT OUTER JOIN (SELECT whaatevaa.id AS is_trending_b FROM (#{filter_trending_sql}) AS whaatevaa) AS whateva ON is_trending_b = ideas.id")
         .group('ideas.id, idea_trending_infos.mean_activity_at')
         .select('ideas.*, count(is_trending_b) AS is_trending')
         .left_outer_joins(:idea_trending_info)
         .select("ideas.*, (GREATEST(((ideas.upvotes_count - ideas.downvotes_count) + 1), 1) / GREATEST((#{Time.now.to_i} - extract(epoch from idea_trending_infos.mean_activity_at)), 1)) AS score")
         .order('is_trending DESC, score DESC')
  end


  def trending_score idea
    # used for testing purposes
    upvotes_ago = activity_ago idea.upvotes # .select { |v| v.user&.id != idea.author&.id }
    comments_ago = activity_ago idea.comments # .select { |c| c.author&.id != idea.author&.id }
    last_activity_at = (upvotes_ago+comments_ago+[(Time.now.to_i - idea.published_at.to_i)]).min
    mean_activity_at = mean(upvotes_ago+comments_ago+[(Time.now.to_i - idea.published_at.to_i)])
    score = trending_score_formula (idea.upvotes_count - idea.downvotes_count), mean_activity_at
    if (idea.upvotes_count - idea.downvotes_count) < 0
      return -1 / score
    end
    if idea.idea_status.code == 'rejected'
      return -1 / score
    end
    if (Time.now.to_i - idea.published_at.to_i) > IdeaTrendingInfo::TREND_SINCE_ACTIVITY
      return -1 / score
    end
    score
  end

  def trending? idea
    # used for testing purposes
    trending_score(idea) >= 0
  end


  private

  def trending_score_formula votes_diff, mean_activity_at
    [(1 + votes_diff), 1].max / [mean_activity_at,1].max
  end

  def activity_ago iteratables
    iteratables.map{ |obj| Time.now.to_i - obj.created_at.to_i }
  end

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end

end