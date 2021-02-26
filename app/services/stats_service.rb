class StatsService

  def group_by_time resource, field, start_at, end_at, interval
    resource.send("group_by_#{interval}",
      field, 
      range: start_at..end_at,
      time_zone: AppConfiguration.instance.settings('core','timezone')
    ).count
  end

  def group_by_time_cumulative resource, field, start_at, end_at, interval
    serie = group_by_time(resource, field, start_at, end_at, interval)
    count_at_start_at = resource.where("#{field} < ?", start_at).count
    # When the given resource scope is a GROUP BY query
    if count_at_start_at.kind_of? Hash
      serie.inject(count_at_start_at) do |totals, (group, count)|
        totals[group.first] = 0 unless totals[group.first]
        totals[group.first] += count
        serie[group] = totals[group.first]
        totals
      end
    else # When the given reource scope is a normal query
      serie.inject(count_at_start_at) do |total, (date, count)|
        serie[date] = count + total
      end
    end
    serie
  end

  def filter_users_by_topic users_scope, topic_id
    ideas = Idea
      .joins(:ideas_topics)
      .where(ideas_topics: {topic_id: topic_id})

    idea_authors = ideas.pluck(:author_id)
    comment_authors = Comment.where(post_id: ideas).pluck(:author_id)
    voters = Vote.where(votable_type: 'Idea', votable_id: ideas).pluck(:user_id)

    users_scope.where(id: idea_authors + comment_authors + voters)
  end
end