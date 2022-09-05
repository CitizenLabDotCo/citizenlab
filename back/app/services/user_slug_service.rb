# frozen_string_literal: true

class UserSlugService
  def generate_slug(user, string)
    return SecureRandom.uuid if abbreviated_user_names?

    SlugService.new.generate_slug user, string
  end

  def generate_slugs(unpersisted_users)
    if abbreviated_user_names?
      generate_slugs_from_uuids unpersisted_users
    else
      # Since invites will later be created in a single transaction, the
      # normal mechanism for generating slugs could result in non-unique
      # slugs. Therefore we generate the slugs manually
      unpersisted_users.zip(SlugService.new.generate_slugs(unpersisted_users, &:full_name)) do |(user, slug)|
        user.slug = slug if user.full_name.present?
      end
    end
  end

  private

  def abbreviated_user_names?
    AppConfiguration.instance.feature_activated?('abbreviated_user_names')
  end

  def generate_slugs_from_uuids(unpersisted_records)
    unpersisted_records.each do |record|
      record.slug = SecureRandom.uuid
    end
  end
end
