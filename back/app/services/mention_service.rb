class MentionService


  # @param [User] user
  # @return [String] mention
  def user_to_mention user
    "@#{user.slug}"
  end

  # @param [String] text
  # @return [User::ActiveRecord_Relation] users
  def extract_expanded_mention_users text
    doc = Nokogiri::HTML.fragment(text)
    expanded_mentions = doc.css("span.cl-mention-user")
    user_ids = expanded_mentions.map do |mention|
      mention.attr('data-user-id')
    end
    User.where(id: user_ids.uniq)
  end

  # @param [String] text
  # @param [User] user
  # @return [String] text with plain mentions replaced by mention tags.
  def add_span_around text, user
    mention = user_to_mention(user)
    name_service = UserDisplayNameService.new(AppConfiguration.instance)
    text.gsub(
        /#{mention}/i,
        "<span class=\"cl-mention-user\" data-user-id=\"#{user.id}\" data-user-slug=\"#{user.slug}\">@#{name_service.display_name(user)}</span>"
    )
  end

  # Replaces plain mentions ('@mention') by mention tags ('<span ...>@mention</span>') in 'text'.
  # It can handle text that already contains mention tags. It returns the new text along with the
  # list of identifiers of newly-mentioned users.
  #
  # @param [String] text
  # @return [Array(String, Array<String>)] the new text and ids of newly-mentioned users
  def process_mentions text
    users_mentioned_before = extract_expanded_mention_users(text)
    cleaned_text = remove_expanded_mentions(text)
    mention_candidates = extract_mentions(cleaned_text)

    return [text, []] if mention_candidates.empty?

    users_mentioned_now = User.where(slug: mention_candidates)
    new_users_mentioned = (users_mentioned_now - users_mentioned_before).map(&:id)

    new_text = users_mentioned_now.all.inject(cleaned_text) do |memo, user|
      add_span_around(memo, user)
    end

    [new_text, new_users_mentioned]
  end

  # @param [String] old_text
  # @param [String] new_text
  # @return [User::ActiveRecord_Relation] users
  def new_mentioned_users old_text, new_text
    old_users = extract_expanded_mention_users(old_text).all
    new_users = extract_expanded_mention_users(new_text).all
    new_users - old_users
  end

  # @param [String] query
  # @param [Post] post
  # @param [Integer] limit
  # @return [Array<User>]
  def users_from_post query, post, limit
    user_ids = User.joins(:comments).where(comments: {post_id: post.id}).ids.uniq # Commenters' IDs
    user_ids << post.author_id if post.author_id
    User.where(id: user_ids).by_username(query).limit(limit).to_a
  end

  private

  # @param [String] text
  # @return [String] text without mention tags
  def remove_expanded_mentions text
    doc = Nokogiri::HTML.fragment(text)
    expanded_mentions = doc.css("span.cl-mention-user")
    expanded_mentions.each do |el|
      user = User.find_by(id: el.attributes["data-user-id"].inner_html)
      if user
        el.replace(user_to_mention(user))
      else
        el.replace(el.inner_html)
      end
    end
    doc.to_s
  end

  # @param [String] text
  # @return [Array<String>] list of slugs
  def extract_mentions text
    full_mentions = text.scan(/(@\w+-[\w-]+)/).flatten
    full_mentions.map do |fm|
      mention_to_slug(fm)
    end
  end

  # @param [String] mention
  # @return [String] slug
  def mention_to_slug mention
    mention[1..-1]
  end

end