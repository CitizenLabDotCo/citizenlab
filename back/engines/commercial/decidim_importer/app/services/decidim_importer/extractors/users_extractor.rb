# frozen_string_literal: true

require Rails.root.join('lib/email_domain_blacklist')

module DecidimImporter
  module Extractors
    # Decidim users CSV (`02--users.csv`) ──▶ Go Vocal `User`.
    #
    # Only **confirmed, non-deleted, non-blocked** accounts with an email Go Vocal would accept are
    # imported (planning decision: no spam/anonymised accounts, no unconfirmed-email accounts, no
    # passwords). Decidim exports carry plenty of spam accounts whose email domain is on Go Vocal's
    # blacklist (`config/our_domain_blacklist.txt` + the disposable-domains list); the `User` model
    # rejects those, and since template application is all-or-nothing, a single one would abort the
    # whole import — so they're skipped here. The Decidim `uid` is preserved verbatim in
    # `unique_code` so contributions can be re-linked. The plain-text "about" and personal URL are
    # folded into the bio; demographics found in `extended_data` (Decidim's JSON blob for the
    # configured extra user fields) go into `custom_field_values`.
    class UsersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        name: 'name',
        email: 'email',
        blocked: 'blocked',
        confirmed_at: 'confirmed_at',
        deleted_at: 'deleted_at',
        locale: 'locale',
        about: 'about',
        personal_url: 'personal_url',
        avatar: 'avatar',
        admin: 'admin',
        extended_data: 'extended_data',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      GENDER_MAP = { 'male' => 'male', 'female' => 'female', 'other' => 'unspecified' }.freeze

      # @param extra_text_field_keys [Array<String>] `extended_data` keys that the organization's
      #   `extra_user_fields` config exposes as free-text Go Vocal custom fields (e.g.
      #   'phone_number'). Their raw values are copied verbatim onto `custom_field_values`.
      def initialize(rows, ref_map, extra_text_field_keys: [], **)
        super(rows, ref_map, **)
        @extra_text_field_keys = extra_text_field_keys
      end

      def run
        rows.filter_map { |row| build_user(row) }
      end

      private

      def build_user(row)
        uid = present_value(row[COLUMNS[:uid]])
        email = present_value(row[COLUMNS[:email]])
        return nil if uid.nil?
        return nil if email.nil?
        return nil if present_value(row[COLUMNS[:deleted_at]])
        return nil if present_value(row[COLUMNS[:confirmed_at]]).nil?
        return nil if truthy?(row[COLUMNS[:blocked]])
        return nil if blacklisted_email_domain?(email)

        attributes = {
          'email' => email,
          'locale' => locale_mapper.map(row[COLUMNS[:locale]]),
          'bio_multiloc' => bio_multiloc(row),
          'unique_code' => uid,
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

        avatar = present_value(row[COLUMNS[:avatar]])
        attributes['remote_avatar_url'] = avatar if avatar

        ref_map.register(uid, Record.new('user', attributes))
      end

      # True when the email's domain is on the same blacklist the `User` model validates against, so
      # we skip the account rather than letting it fail (and roll back) the whole import.
      def blacklisted_email_domain?(email)
        domain = email.split('@').last&.strip&.downcase
        return false if domain.blank?

        email_domain_blacklist.include?(domain)
      end

      def email_domain_blacklist
        @email_domain_blacklist ||= EmailDomainBlacklist.load.to_set
      end

      # Decidim stores a single display name; split into first/last (last token => last name).
      def name_attributes(row)
        name = present_value(row[COLUMNS[:name]])
        return { 'first_name' => 'Unknown' } if name.nil?

        parts = name.split(/\s+/)
        return { 'first_name' => name } if parts.size == 1

        { 'first_name' => parts[0..-2].join(' '), 'last_name' => parts[-1] }
      end

      # `about` is a plain string (sometimes a multiloc JSON on multilingual platforms); the URL is
      # appended as an HTML paragraph in each present locale.
      def bio_multiloc(row)
        about = multiloc(row[COLUMNS[:about]])
        url = present_value(row[COLUMNS[:personal_url]])
        return about if url.nil?

        url_html = "<p>#{url}</p>"
        return { primary_locale => url_html } if about.empty?

        about.transform_values { |text| [text, url_html].compact.join("\n") }
      end

      def roles_for(row)
        truthy?(row[COLUMNS[:admin]]) ? [{ 'type' => 'admin' }] : []
      end

      # Decidim's `extended_data` is a JSON blob holding the configured extra user fields
      # (gender, phone_number, date_of_birth, …). Pick the demographic ones GV has built-in slots
      # for.
      def custom_field_values(row)
        data = try_parse_json(row[COLUMNS[:extended_data]]) || {}
        values = {}

        gender = GENDER_MAP[present_value(data['gender'])&.downcase]
        values['gender'] = gender if gender

        birthyear = birthyear_from(data['date_of_birth'])
        values['birthyear'] = birthyear if birthyear

        @extra_text_field_keys.each do |key|
          value = present_value(data[key])
          values[key] = value if value
        end

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
