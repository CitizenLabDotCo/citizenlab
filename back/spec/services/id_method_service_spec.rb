# frozen_string_literal: true

require 'rails_helper'

describe IdMethodService do
  let(:service) { described_class.new }

  before do
    AppConfiguration.instance.settings['verification'] = {
      verification_methods: [
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

    it 'returns information about the first enabled method enabled for actions' do
      create(:custom_field_gender)
      create(:custom_field_birthyear)

      configuration = AppConfiguration.instance
      configuration.settings['verification']['verification_methods'] << { name: 'fake_sso', enabled_for_verified_actions: true }
      configuration.save!

      metadata = service.method_metadata(service.all_methods.find { |m| m[:name] == 'fake_sso' })
      expect(metadata[:name]).to eq 'Fake SSO'
      expect(metadata[:locked_attributes]).to contain_exactly({ 'en' => 'First name(s)', 'fr-FR' => 'Prénom(s)', 'nl-NL' => 'Voornamen' }, { 'en' => 'Last name', 'fr-FR' => 'Nom de famille', 'nl-NL' => 'Achternaam' })
      expect(metadata[:other_attributes]).to contain_exactly({ 'en' => 'Email', 'fr-FR' => 'E-mail', 'nl-NL' => 'E-mail' })
      expect(metadata[:locked_custom_fields]).to contain_exactly({ 'en' => 'gender' }, { 'en' => 'birthyear' })
      expect(metadata[:other_custom_fields]).to be_empty
    end
  end
end
