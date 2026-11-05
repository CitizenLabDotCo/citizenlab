# NOTE: Apr 2026 - Slug is still generated for users but no longer used in the codebase.
# It will be removed in the near future when we are sure there is no further use for it.
class UserSlugService
  def generate_slug(user, string)
    string = plain_text(string)
    # A blank slug fails validation.
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
      # Guard on the name, not the slug: SlugService returns '' for the first blank name
      # and '-1' for the next. A pending invitee skips slug validation and gets one on accept.
      unpersisted_users.zip(slugs) do |(user, slug)|
        user.slug = slug if plain_names[user].present?
      end
    end
  end

  private

  # Two of the three callers never reach `User`'s own sanitisation: an invite assigns the slug
  # outside the callback chain, and the users controller builds the name from the request.
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
