module EmailCampaigns
  class PeriodicEventsService

    def activity_score idea, since
      recent_activity = 1 + activity_count(idea, since=since)
      if idea.published_at
        (recent_activity**2) / (Time.now.to_i - idea.published_at.to_i)
      else
        0.0
      end
    end

    def activity_count idea, since
      idea_recent_votes(idea, since=since).select{|v| v.mode == 'up'}.select{|v| v.user_id != idea.author_id}.size + idea_recent_comments(idea, since=since).size
    end

    def increase_hash timestamps, days_interval
      last_2n_ago = timestamps.select{|ts| ts > (Time.now - (days_interval * 2))}
      last_n_ago = last_2n_ago.select{|ts| ts > (Time.now - days_interval)}
      {
        increase: last_n_ago.size,
        past_increase: (last_2n_ago.size - last_n_ago.size)
      }
    end

    def to_periodic_report_idea_hash idea, since
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        url: FrontendService.new.model_to_url(idea),
        published_at: idea.published_at,
        author_name: idea.author_name,
        upvotes_count: idea.upvotes_count,
        upvotes_increment: idea_recent_votes(idea, since).select{|v| v.mode == 'up'}.count,
        downvotes_count: idea.downvotes_count,
        downvotes_increment: idea_recent_votes(idea, since).select{|v| v.mode == 'down'}.count,
        comments_count: idea.comments_count,
        comments_increment: idea_recent_comments(idea, since).count
      }
    end


    private

    def idea_recent_votes idea, since
      idea.votes.select{|v| v.created_at > since}
    end

    def idea_recent_comments idea, since
      idea.comments.select{|c| c.created_at > since}
    end

  end
end