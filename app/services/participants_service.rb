class ParticipantsService

  def participants options={}
    project = options[:project]
    since = options[:since]
    if project
      ideas = Idea.where(project: project)
      comments = Comment.all.where(idea_id: ideas.map(&:id))
      votes = Vote.where(votable_id: (ideas.map(&:id) + comments.map(&:id)))
      if since
        ideas = ideas.where('created_at::date >= (?)::date', since)
        comments = comments.where('created_at::date >= (?)::date', since)
        votes = votes.where('created_at::date >= (?)::date', since)
      end
      User.where(id: (ideas.map(&:author_id) + comments.map(&:author_id) + votes.map(&:user_id)).uniq)
    else
      activities = Activity.all
      if since
        activities = activities.where('acted_at::date >= (?)::date', since)
      end
      User.where(id: activities.map(&:user_id))
    end
  end

end