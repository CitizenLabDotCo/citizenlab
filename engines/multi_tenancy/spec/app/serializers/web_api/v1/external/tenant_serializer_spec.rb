require 'rails_helper'

describe 'WebApi::V1::External::TenantSerializer' do

  let(:serialized_tenant) {
    { id: Tenant.current.id,
      name: 'test-tenant',
      host: 'example.org',
      settings: {
        'core' =>
          { 'allowed' => true,
            'enabled' => true,
            'locales' => %w[en fr-FR nl-NL],
            'currency' => 'EUR',
            'timezone' => 'Brussels',
            'color_main' => anything,
            'color_text' => anything,
            'color_secondary' => anything,
            'lifecycle_stage' => 'active',
            'organization_name' => { 'en' => 'Liege', 'fr-FR' => 'Liege', 'nl-NL' => 'Luik' },
            'organization_type' => 'medium_city' },
        'initiatives' =>
          { 'allowed' => true,
            'enabled' => true,
            'days_limit' => 90,
            'success_stories' => [],
            'voting_threshold' => 300,
            'eligibility_criteria' => { 'en' => 'Eligibility criteria' },
            'threshold_reached_message' => { 'en' => 'Threshold reached' } } },
      style: {},
      logo: { 'small' => nil, 'medium' => nil, 'large' => nil },
      header_bg: { 'large' => nil, 'medium' => nil, 'small' => nil } }
  }

  it 'serializes Tenant correctly' do # regression test
    expect(
      WebApi::V1::External::TenantSerializer.new(Tenant.current).serializable_hash
    ).to match(serialized_tenant)
  end
end
