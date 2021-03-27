class TrendingIdeaService
  def filter_trending(ideas = Idea.all)
    with_trending_score(ideas)
      .where('sub.is_trending' => true)
  end

  def sort_trending(ideas = Idea.all)
    with_trending_score(ideas)
      .order('trending_score DESC')
  end

  def with_trending_score(ideas = Idea.all)
    sub_query = Idea
      .joins(:idea_status)
      .joins(:idea_trending_info)
      .select(
        <<-SQL
          ideas.id,
          NOT (
            ideas.upvotes_count - ideas.downvotes_count < 0 OR
            ideas.created_at < timestamp \'#{Time.at(Time.now.to_i - IdeaTrendingInfo::TREND_SINCE_ACTIVITY)}\' OR
            idea_statuses.code = 'rejected'
          ) AS is_trending,
          GREATEST(((ideas.upvotes_count - ideas.downvotes_count) + 1), 1) / GREATEST((#{Time.now.to_i} - extract(epoch from idea_trending_infos.mean_activity_at)), 1) AS score_abs
        SQL
      )

    ideas
      .joins("INNER JOIN (#{sub_query.to_sql}) sub ON ideas.id = sub.id")
      .select(
        <<-SQL
          ideas.*,
          CASE WHEN sub.is_trending THEN sub.score_abs ELSE (-1/sub.score_abs) END as trending_score
        SQL
      )
  end


  def trending_score(idea)
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
    if (Time.now.to_i - idea.created_at.to_i) > IdeaTrendingInfo::TREND_SINCE_ACTIVITY
      return -1 / score
    end
    score
  end

  def trending? idea
    # used for testing purposes
    trending_score(idea) >= 0
  end


  private

  def trending_score_formula(votes_diff, mean_activity_at)
    [(1 + votes_diff), 1].max / [mean_activity_at,1].max
  end

  def activity_ago(iteratables)
    iteratables.map { |obj| Time.now.to_i - obj.created_at.to_i }
  end

  def mean(arr)
    arr.empty? ? 0 : arr.sum.to_f / arr.size
  end
end
