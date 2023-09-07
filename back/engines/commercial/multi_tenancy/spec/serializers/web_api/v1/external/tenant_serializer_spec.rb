# frozen_string_literal: true

require 'rails_helper'

# Regression tests
describe 'WebApi::V1::External::TenantSerializer' do
  let(:tenant_attrs) do
    { id: Tenant.current.id,
      name: 'test-tenant',
      host: 'example.org',
      settings: {
        'core' =>
          {
            'allowed' => true,
            'enabled' => true,
            'locales' => %w[en fr-FR nl-NL],
            'currency' => 'EUR',
            'timezone' => 'Europe/Brussels',
            'color_main' => anything,
            'color_text' => anything,
            'color_secondary' => anything,
            'lifecycle_stage' => 'active',
            'organization_name' => { 'en' => 'Liege', 'fr-FR' => 'Liege', 'nl-NL' => 'Luik' },
            'organization_type' => 'medium_city',
            'authentication_token_lifetime_in_days' => 30
          },
        'initiatives' =>
          { 'allowed' => true,
            'enabled' => true,
            'days_limit' => 90,
            'reacting_threshold' => 300,
            'eligibility_criteria' => { 'en' => 'Eligibility criteria' },
            'posting_tips' => { 'en' => 'Posting tips' },
            'threshold_reached_message' => { 'en' => 'Threshold reached' } }
      },
      style: {},
      logo: { 'small' => nil, 'medium' => nil, 'large' => nil } }
  end

  describe '#serializable_hash' do
    subject(:result) { WebApi::V1::External::TenantSerializer.new(Tenant.current).serializable_hash }

    it 'serializes Tenant correctly' do
      expect(result).to include(**tenant_attrs.except(:settings))
      expect(result[:settings]).to include(**tenant_attrs[:settings])
    end

    context 'when the app configuration is passed explicitly' do
      subject(:result) do
        tenant = Tenant.current
        WebApi::V1::External::TenantSerializer.new(tenant, app_configuration: tenant.configuration).serializable_hash
      end

      it 'serializes Tenant correctly' do
        expect(result).to include(**tenant_attrs.except(:settings))
        expect(result[:settings]).to include(**tenant_attrs[:settings])
      end
    end
  end
end
