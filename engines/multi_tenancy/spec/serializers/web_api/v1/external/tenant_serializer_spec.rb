# frozen_string_literal: true

require 'rails_helper'

# Regression tests
describe 'WebApi::V1::External::TenantSerializer' do

  let(:serialized_tenant) do
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
  end

  it 'serializes Tenant correctly' do
    expect(
      WebApi::V1::External::TenantSerializer.new(Tenant.current).serializable_hash
    ).to match(serialized_tenant)
  end

  context 'when the app configuration is passed explicitly' do
    it 'serializes Tenant correctly' do
      tenant = Tenant.current
      tenant_serializer = WebApi::V1::External::TenantSerializer.new(tenant, app_configuration: tenant.configuration)
      expect(tenant_serializer.serializable_hash).to match(serialized_tenant)
    end
  end
end
