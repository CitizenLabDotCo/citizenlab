# frozen_string_literal: true

require 'rails_helper'

describe OmniauthMethods::AzureActiveDirectory do
  describe 'profile_to_user_attrs' do
    let(:auth) do
      OpenStruct.new({
        provider: 'azureactivedirectory',
        info: OpenStruct.new({
          'name' => 'jos_jossens',
          'first_name' => 'Jos',
          'last_name' => 'Jossens',
          'email' => 'jos@josnet.com',
          'image' => 'http://www.josnet.com/my-picture'
        }),
        extra: OpenStruct.new({
          raw_info: OpenStruct.new({
            locale: 'fr'
          })
        })
      })
    end

    it 'correctly interprets user attributes for Azure AD' do
      expect(subject.profile_to_user_attrs(auth)).to match({
        first_name: 'Jos',
        last_name: 'Jossens',
        email: 'jos@josnet.com',
        remote_avatar_url: 'http://www.josnet.com/my-picture',
        locale: 'fr-FR'
      })
    end

    it 'correctly interprets user attributes when email is nil' do
      auth.info['email'] = nil
      expect(subject.profile_to_user_attrs(auth)).to match({
        first_name: 'Jos',
        last_name: 'Jossens',
        email: nil,
        remote_avatar_url: 'http://www.josnet.com/my-picture',
        locale: 'fr-FR'
      })
    end

    it 'correctly interprets user attributes when email and names are empty' do
      auth.info['email'] = ''
      auth.info['first_name'] = ''
      auth.info['last_name'] = ''
      expect(subject.profile_to_user_attrs(auth)).to match({
        first_name: 'jos_jossens',
        last_name: 'jos_jossens',
        email: nil,
        remote_avatar_url: 'http://www.josnet.com/my-picture',
        locale: 'fr-FR'
      })
    end
  end
end
