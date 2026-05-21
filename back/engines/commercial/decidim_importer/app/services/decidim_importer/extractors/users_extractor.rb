# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `decidim_users` ──▶ Go Vocal `User`.
    #
    # Only **confirmed, non-deleted** users are imported (planning decision: no deleted/anonymised
    # accounts, no unconfirmed-email accounts, no passwords). The Decidim numeric id is preserved in
    # `unique_code` as the `"decidim_users-<id>"` join key so contributions can be re-linked later.
    # The "about" text and personal URL are folded into the bio; demographics go into
    # `custom_field_values`.
    class UsersExtractor < BaseExtractor
      TABLE = 'decidim_users'

      # Assumed Decidim export headers — override when the real export is available.
      COLUMNS = {
        id: 'id',
        name: 'name',
        email: 'email',
        confirmed_at: 'confirmed_at',
        deleted_at: 'deleted_at',
        locale: 'locale',
        about: 'about',
        personal_url: 'personal_url',
        avatar_url: 'avatar_url',
        admin: 'admin',
        created_at: 'created_at',
        updated_at: 'updated_at',
        gender: 'gender',
        birth_date: 'birth_date'
      }.freeze

      GENDER_MAP = { 'male' => 'male', 'female' => 'female', 'other' => 'unspecified' }.freeze

      def run
        rows.filter_map { |row| build_user(row) }
      end

      private

      def build_user(row)
        id = present_value(row[COLUMNS[:id]])
        email = present_value(row[COLUMNS[:email]])
        return nil if id.nil?
        return nil if email.nil? # planning: only import users with an email
        return nil if present_value(row[COLUMNS[:deleted_at]]) # skip deleted/anonymised accounts
        return nil if present_value(row[COLUMNS[:confirmed_at]]).nil? # only confirmed emails

        attributes = {
          'email' => email,
          'locale' => locale_mapper.map(row[COLUMNS[:locale]]),
          'bio_multiloc' => bio_multiloc(row),
          'unique_code' => RefMap.key(TABLE, id),
          'registration_completed_at' => timestamp(row[COLUMNS[:created_at]]),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]]),
          'imported' => true,
          # No password is migrated; users will set one via the post-migration invite flow. A
          # random one keeps the record valid until then.
          'password' => SecureRandom.urlsafe_base64(32)
        }
        attributes.merge!(name_attributes(row))

        roles = roles_for(row)
        attributes['roles'] = roles if roles.any?

        cfv = custom_field_values(row)
        attributes['custom_field_values'] = cfv if cfv.any?

        avatar = present_value(row[COLUMNS[:avatar_url]])
        attributes['remote_avatar_url'] = avatar if avatar

        ref_map.register(TABLE, id, Record.new('user', attributes))
      end

      # Decidim stores a single display name; split into first/last (last token => last name).
      def name_attributes(row)
        name = present_value(row[COLUMNS[:name]])
        return { 'first_name' => 'Unknown' } if name.nil?

        parts = name.split(/\s+/)
        return { 'first_name' => name } if parts.size == 1

        { 'first_name' => parts[0..-2].join(' '), 'last_name' => parts[-1] }
      end

      def bio_multiloc(row)
        about = present_value(row[COLUMNS[:about]])
        url = present_value(row[COLUMNS[:personal_url]])
        return {} if about.nil? && url.nil?

        text = [about, url && "<p>#{url}</p>"].compact.join("\n")
        { primary_locale => text }
      end

      def roles_for(row)
        truthy?(row[COLUMNS[:admin]]) ? [{ 'type' => 'admin' }] : []
      end

      def custom_field_values(row)
        values = {}

        gender = GENDER_MAP[present_value(row[COLUMNS[:gender]])&.downcase]
        values['gender'] = gender if gender

        birthyear = birthyear_from(row[COLUMNS[:birth_date]])
        values['birthyear'] = birthyear if birthyear

        values
      end

      def birthyear_from(value)
        str = present_value(value)
        return nil if str.nil?

        year = str[/\d{4}/]
        year&.to_i
      end
    end
  end
end
