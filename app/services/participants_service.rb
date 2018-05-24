class ParticipantsService

  def participants options={}
    project = options[:project]
    since = options[:since]
    if project
      ideas = Idea.where(project: project)
      comments = Comment.all.where(idea_id: ideas.ids)
      votes = Vote.where(votable_id: (ideas.ids + comments.ids))
      if since
        ideas = ideas.where('created_at::date >= (?)::date', since)
        comments = comments.where('created_at::date >= (?)::date', since)
        votes = votes.where('created_at::date >= (?)::date', since)
      end
      User.where(id: (ideas.distinct.pluck(:author_id) + comments.distinct.pluck(:author_id) + votes.distinct.pluck(:user_id)).uniq)
    else
      activities = Activity.all
      if since
        activities = activities.where('acted_at::date >= (?)::date', since)
      end
      User.where(id: activities.distinct.pluck(:user_id))
    end
  end

end