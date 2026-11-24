# frozen_string_literal: true

require 'rails_helper'

describe IdMethodService do
  let(:service) { described_class.new }

  before do
    AppConfiguration.instance.settings['id_config'] = {
      allowed: true,
      enabled: true,
      id_methods: [
        { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' }
      ]
    }

    AppConfiguration.instance.save!
  end

  describe 'configured_methods' do
    using RSpec::Parameterized::TableSyntax

    subject(:names) { service.configured_methods(AppConfiguration.instance).map(&:name) }

    before do
      AppConfiguration.instance.settings['id_config']['id_methods'] += [{ name: 'bogus' }, { name: 'fake_sso' }]
      AppConfiguration.instance.save!
      change_lifecycle_stage(lifecycle_stage)
    end

    where(:lifecycle_stage, :test_methods_listed) do
      'demo'           | true
      'not_applicable' | true
      'active'         | false
      'trial'          | false
      'expired_trial'  | false
      'churned'        | false
    end

    with_them do
      it 'lists the test-only methods only on demo and e2e platforms' do
        expected = test_methods_listed ? %w[cow bogus fake_sso] : %w[cow]
        expect(names).to match_array expected
      end
    end

    context 'in development' do
      let(:lifecycle_stage) { 'active' }

      before { allow(Rails.env).to receive(:development?).and_return(true) }

      it 'lists the test-only methods whatever the lifecycle stage' do
        expect(names).to match_array %w[cow bogus fake_sso]
      end
    end
  end

  describe 'method_metadata' do
    it 'returns allowed_for_verified_actions: false if first method does not support verified actions' do
      vm = service.method_metadata(service.all_methods.first)
      expect(vm[:allowed_for_verified_actions]).to be(false)
    end
  end
end
