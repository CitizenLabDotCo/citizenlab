# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::Federa::FederaOmniauth do
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
              # FedERa returns names in ALL CAPITALS; they should be proper-cased.
              'nome' => ['MARIO'],
              'cognome' => ['ROSSI'],
              'emailAddressPersonale' => ['mario.rossi@example.it'],
              'comuneDomicilio' => ['1234'],
              'dataNascita' => ['1980-01-01'],
              'spidCode' => ['SPID-1234-abcd'],
              'CodiceFiscale' => ['RSSMRA80A01H501U']
            },
            'response_object' => OneLogin::RubySaml::Response.new('fakeresponse')
          }
        }
      )
    end

    before do
      # Create user custom fields that will be filled by the auth hash
      create(:custom_field, key: 'birthyear', resource_type: 'User')
      create(:custom_field, key: 'municipality_code', resource_type: 'User')
    end

    it 'returns user attrs from profile response' do
      attrs = omniauth.profile_to_user_attrs(auth)

      expect(attrs).to eq(
        first_name: 'Mario',
        last_name: 'Rossi',
        email: 'mario.rossi@example.it',
        custom_field_values: { 'birthyear' => 1980, 'municipality_code' => '1234' }
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
              'nome' => ['MARIO'],
              'cognome' => ['ROSSI'],
              'CodiceFiscale' => ['RSSMRA80A01H501U']
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
                'spidCode' => ['SPID-1234-abcd'],
                'CodiceFiscale' => ['RSSMRA80A01H501U']
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
                'CodiceFiscale' => ['RSSMRA80A01H501U']
              }
            }
          }
        )
      end

      it 'falls back to CodiceFiscale' do
        expect(omniauth.profile_to_uid(auth)).to eq('RSSMRA80A01H501U')
      end
    end
  end

  describe '#email_always_present?' do
    it 'returns false' do
      expect(omniauth.email_always_present?).to be false
    end
  end

  describe '#filter_auth_to_persist' do
    let(:auth) do
      OmniAuth::AuthHash.new(
        {
          'provider' => 'federa',
          'uid' => 'ABCD1234',
          'extra' => {
            'raw_info' => { 'nome' => ['Mario'] },
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
