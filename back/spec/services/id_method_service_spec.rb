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

  describe 'method_metadata' do
    it 'returns allowed_for_verified_actions: false if first method does not support verified actions' do
      vm = service.method_metadata(service.all_methods.first)
      expect(vm[:allowed_for_verified_actions]).to be(false)
    end
  end
end
