# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::UserCustomFields do
  let(:locale_mapper) { DecidimImporter::LocaleMapper.new }

  def from_config(extra_user_fields)
    described_class.new(
      { 'extra_user_fields' => extra_user_fields },
      locale_mapper: locale_mapper, primary_locale: 'fr-FR'
    )
  end

  it 'creates a custom field for each enabled non-built-in field, skipping built-ins and disabled ones' do
    subject = from_config(
      '{"enabled":true,"gender":{"enabled":true},"date_of_birth":{"enabled":true},' \
      '"phone_number":{"enabled":true},"postal_code":{"enabled":false}}'
    )

    expect(subject.text_field_keys).to eq(%w[phone_number])
    definition = subject.definitions.first
    expect(definition).to include(key: 'phone_number', input_type: 'text')
    expect(definition[:title_multiloc]).to include('fr-FR' => 'Numéro de téléphone', 'en' => 'Phone number')
  end

  it 'ignores everything when the extra-user-fields feature is disabled' do
    subject = from_config('{"enabled":false,"phone_number":{"enabled":true}}')
    expect(subject.definitions).to be_empty
  end

  it 'returns nothing when there is no organization row' do
    subject = described_class.new(nil, locale_mapper: locale_mapper, primary_locale: 'fr-FR')
    expect(subject.definitions).to be_empty
  end

  it 'registers a User custom_field record into the ref map' do
    ref_map = DecidimImporter::RefMap.new
    from_config('{"enabled":true,"phone_number":{"enabled":true}}').register!(ref_map)

    record = ref_map.fetch('decidim-userfield-phone_number')
    expect(record.model_name).to eq('custom_field')
    expect(record.attributes).to include(
      'resource_type' => 'User', 'key' => 'phone_number', 'input_type' => 'text', 'enabled' => true
    )
    expect(record.attributes).not_to have_key('code')
  end
end
