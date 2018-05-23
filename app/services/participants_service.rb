class ParticipantsService

  def participants options={}
    project = options[:project]
    since = options[:since]
    if project
      User.all # TODO
    else
      activities = Activity.all.left_outer_joins(:user)
      if since
        activities = activities.where('acted_at::date >= (?)::date', since)
      end
      User.where(id: activities.map(&:user_id))
    end
  end

end