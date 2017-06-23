class MentionService

  def mention_to_slug mention
    mention[1..-1]
  end

  def user_to_mention user
    "@#{user.slug}"
  end

  def extract_mentions text
    full_mentions = text.scan(/(@\w+-\w+)/).flatten
    full_mentions.map do |fm|
      mention_to_slug(fm)
    end
  end

  def add_span_around text, mention, user_id
    text.gsub(/#{mention}/i, "<span class=\"cl-mention-user\" data-user-id=\"#{user_id}\">#{mention}</span>")
  end

  def process_mentions text
    mention_candidates = extract_mentions(text)
    users = mention_candidates.inject(User) do |scope, slug|
      scope.or(User.where(slug: slug))
    end
    users.all.inject(text) do |memo, user|
      add_span_around(memo, user_to_mention(user), user.id)
    end
  end

  def users_from_idea slug, idea, limit
    author = idea.author
    commenters = User
      .joins(:comments)
      .where("users.slug LIKE ?", "#{slug}%")
      .where(comments: {idea_id: idea.id})
      .limit(limit)
    [author, *commenters].uniq
  end

end