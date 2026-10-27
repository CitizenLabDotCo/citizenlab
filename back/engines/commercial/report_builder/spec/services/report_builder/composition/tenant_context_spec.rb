# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::TenantContext do
  before do
    configuration = AppConfiguration.instance
    configuration.settings['core']['organization_name'] = { 'en' => 'Riverside Council', 'nl-BE' => 'Gemeente Riverside' }
    configuration.settings['core']['locales'] = %w[en nl-BE]
    configuration.settings['core']['color_main'] = '#044d6c'
    configuration.save!
  end

  it 'names the organisation in the report locale' do
    text = described_class.new(locale: 'nl-BE').to_prompt_text

    expect(text).to include 'Organisation: Gemeente Riverside'
    expect(text).to include 'This report is written in "nl-BE"'
  end

  it 'lists every platform locale and the brand colours' do
    text = described_class.new(locale: 'en').to_prompt_text

    expect(text).to include 'Platform locales: en, nl-BE'
    expect(text).to include 'primary #044d6c'
    expect(text).to include 'theme.colors.tenantPrimary'
  end
end
