# NOTE: Apr 2026 - Slug is still generated for users but no longer used in the codebase.
# It will be removed in the near future when we are sure there is no further use for it.
class UserSlugService
  def generate_slug(user, string)
    string = plain_text(string)
    # A name of nothing but markup strips to blank, and a blank slug fails validation.
    return SecureRandom.uuid if abbreviated_user_names? || string.blank?

    SlugService.new.generate_slug user, string
  end

  def generate_slugs(unpersisted_users)
    if abbreviated_user_names?
      generate_slugs_from_uuids unpersisted_users
    else
      # Since invites will later be created in a single transaction, the
      # normal mechanism for generating slugs could result in non-unique
      # slugs. Therefore we generate the slugs manually
      plain_names = unpersisted_users.index_with { |user| plain_text(user.full_name).to_s }
      slugs = SlugService.new.generate_slugs(unpersisted_users) { |user| plain_names[user] }
      # Guard on the name, not the slug: a blank name still comes back as '-1' once a second one
      # collides with it. An invitee with nothing to build a slug from keeps none - they are
      # invite_pending, so the slug validation is off, and accepting the invite generates one.
      unpersisted_users.zip(slugs) do |(user, slug)|
        user.slug = slug if plain_names[user].present?
      end
    end
  end

  private

  # A name reaches us before `User` sanitises its own, and two of the three callers never go through
  # `User` at all: an invite assigns the slug outside the callback chain, and the users controller
  # builds the name straight from the request. So strip here rather than trusting the caller.
  def plain_text(name)
    SanitizationService.new.strip_to_plain_text(name)
  end

  def abbreviated_user_names?
    AppConfiguration.instance.feature_activated?('abbreviated_user_names')
  end

  def generate_slugs_from_uuids(unpersisted_records)
    unpersisted_records.each do |record|
      record.slug = SecureRandom.uuid
    end
  end
end
