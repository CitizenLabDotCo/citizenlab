# frozen_string_literal: true

module DecidimImporter
  # Translates a Decidim organization's `extra_user_fields` config (the JSON column on
  # `01--organization.csv` that drives which profile fields participants fill in) into Go Vocal
  # user {CustomField} records for the tenant template, plus the list of `extended_data` keys the
  # {Extractors::UsersExtractor} should copy onto each user's `custom_field_values`.
  #
  # Decidim fields that Go Vocal already seeds as built-ins (`gender`, `date_of_birth` → `birthyear`)
  # are *not* recreated here — the users extractor already maps their values onto the built-in
  # fields. Everything else that's enabled becomes a new free-text registration field.
  class UserCustomFields
    # Decidim extra-field key => Go Vocal custom field spec. All currently map to free-text fields
    # (no options to manage). `title` carries the locales we have canned copy for; the primary
    # locale is backfilled in {#title_for} so the field is always valid.
    EXTRA_FIELDS = {
      'phone_number' => { key: 'phone_number', input_type: 'text',
                          title: { 'en' => 'Phone number', 'fr-FR' => 'Numéro de téléphone' } },
      'postal_code' => { key: 'postal_code', input_type: 'text',
                         title: { 'en' => 'Postal code', 'fr-FR' => 'Code postal' } },
      'location' => { key: 'location', input_type: 'text',
                      title: { 'en' => 'Location', 'fr-FR' => 'Localisation' } },
      'country' => { key: 'country', input_type: 'text',
                     title: { 'en' => 'Country', 'fr-FR' => 'Pays' } }
    }.freeze

    def initialize(org_row, locale_mapper:, primary_locale:)
      @row = org_row || {}
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
    end

    # @return [Array<Hash>] one descriptor per enabled, non-built-in field:
    #   { key:, input_type:, title_multiloc: }.
    def definitions
      @definitions ||= enabled_extra_specs.map do |spec|
        { key: spec[:key], input_type: spec[:input_type], title_multiloc: title_for(spec) }
      end
    end

    # The `extended_data` keys whose values the users extractor should fold into
    # `custom_field_values` (built-ins gender/birthyear are handled separately there).
    def text_field_keys
      definitions.pluck(:key)
    end

    # Registers a `custom_field` {Record} per definition into the ref map so the template builder
    # emits it. Keyed by a synthetic uid since Decidim has no row id for these.
    def register!(ref_map)
      definitions.each do |definition|
        ref_map.register("decidim-userfield-#{definition[:key]}", Record.new('custom_field', attributes_for(definition)))
      end
    end

    private

    def enabled_extra_specs
      config = Parsing.parse_json(@row['extra_user_fields'])
      return [] unless config.is_a?(Hash) && Parsing.truthy?(config['enabled'])

      EXTRA_FIELDS.filter_map do |decidim_key, spec|
        sub = config[decidim_key]
        spec if sub.is_a?(Hash) && Parsing.truthy?(sub['enabled'])
      end
    end

    def attributes_for(definition)
      {
        'resource_type' => 'User',
        'key' => definition[:key],
        'title_multiloc' => definition[:title_multiloc],
        'input_type' => definition[:input_type],
        'required' => false,
        'enabled' => true
        # No `code` (these aren't Go Vocal built-ins) and no `ordering` (acts_as_list appends the
        # field below the tenant's existing registration fields).
      }
    end

    # Ensures the field has a title in the import's primary locale so it always validates, even when
    # we have no canned copy for that locale.
    def title_for(spec)
      title = spec[:title].dup
      title[@primary_locale] ||= spec[:title]['en'] || spec[:key].tr('_', ' ').capitalize
      title
    end
  end
end
