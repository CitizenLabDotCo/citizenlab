# frozen_string_literal: true

require 'rails_helper'

describe IdFedera::FederaOmniauth do
  subject(:omniauth) { described_class.new }

  describe '#profile_to_user_attrs' do
    let(:auth) do
      OmniAuth::AuthHash.new(
        {
          'provider' => 'federa',
          'uid' => 'ABCD1234',
          'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
          'credentials' => {},
          'extra' => {
            'raw_info' => {
              'name' => 'Mario',
              'familyName' => 'Rossi',
              'email' => 'mario.rossi@example.it',
              'domicileMunicipality' => '1234',
              'dateOfBirth' => '1980-01-01',
              'spidCode' => 'SPID-1234-abcd',
              'fiscalNumber' => 'RSSMRA80A01H501U'
            },
            'response_object' => OneLogin::RubySaml::Response.new('fakeresponse')
          }
        }
      )
    end

    before do
      # Create user custom fields that will be filled by the auth hash
      create(:custom_field, key: 'birthyear', resource_type: 'User')
      create(:custom_field, key: 'domicile_municipality', resource_type: 'User')
    end

    it 'returns user attrs from profile response' do
      attrs = omniauth.profile_to_user_attrs(auth)

      expect(attrs).to eq(
        first_name: 'Mario',
        last_name: 'Rossi',
        email: 'mario.rossi@example.it',
        custom_field_values: { 'birthyear' => 1980, 'domicile_municipality' => '1234' }
      )
    end
  end

  describe '#profile_to_user_attrs with missing optional fields' do
    let(:auth) do
      OmniAuth::AuthHash.new(
        {
          'provider' => 'federa',
          'uid' => 'ABCD1234',
          'info' => {},
          'credentials' => {},
          'extra' => {
            'raw_info' => {
              'name' => 'Mario',
              'familyName' => 'Rossi',
              'fiscalNumber' => 'RSSMRA80A01H501U'
            },
            'response_object' => OneLogin::RubySaml::Response.new('fakeresponse')
          }
        }
      )
    end

    it 'returns attrs without email when not present' do
      attrs = omniauth.profile_to_user_attrs(auth)

      expect(attrs).to eq(
        first_name: 'Mario',
        last_name: 'Rossi',
        custom_field_values: {}
      )
    end
  end

  describe '#profile_to_uid' do
    context 'when spidCode is present' do
      let(:auth) do
        OmniAuth::AuthHash.new(
          {
            'extra' => {
              'raw_info' => {
                'spidCode' => 'SPID-1234-abcd',
                'fiscalNumber' => 'RSSMRA80A01H501U'
              }
            }
          }
        )
      end

      it 'returns spidCode as uid' do
        expect(omniauth.profile_to_uid(auth)).to eq('SPID-1234-abcd')
      end
    end

    context 'when spidCode is absent' do
      let(:auth) do
        OmniAuth::AuthHash.new(
          {
            'extra' => {
              'raw_info' => {
                'fiscalNumber' => 'RSSMRA80A01H501U'
              }
            }
          }
        )
      end

      it 'falls back to fiscalNumber' do
        expect(omniauth.profile_to_uid(auth)).to eq('RSSMRA80A01H501U')
      end
    end
  end

  describe '#email_always_present?' do
    it 'returns false' do
      expect(omniauth.email_always_present?).to be false
    end
  end

  describe '#verification_prioritized?' do
    it 'returns true' do
      expect(omniauth.verification_prioritized?).to be true
    end
  end

  describe '#filter_auth_to_persist' do
    let(:auth) do
      OmniAuth::AuthHash.new(
        {
          'provider' => 'federa',
          'uid' => 'ABCD1234',
          'extra' => {
            'raw_info' => { 'name' => 'Mario' },
            'response_object' => OneLogin::RubySaml::Response.new('fakeresponse')
          }
        }
      )
    end

    it 'removes response_object from extra' do
      filtered = omniauth.filter_auth_to_persist(auth)

      expect(filtered[:extra]).not_to have_key(:response_object)
      expect(filtered[:extra][:raw_info]).to be_present
    end
  end
end
