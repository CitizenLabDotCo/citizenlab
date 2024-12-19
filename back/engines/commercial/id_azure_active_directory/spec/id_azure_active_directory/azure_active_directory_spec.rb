# frozen_string_literal: true

require 'rails_helper'

describe IdAzureActiveDirectory::AzureActiveDirectoryOmniauth do
  describe 'profile_to_user_attrs' do
    it 'correctly interprets gender, locale and image for google' do
      auth = OpenStruct.new({
        provider: 'azureactivedirectory',
        info: OpenStruct.new({
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

      expect(subject.profile_to_user_attrs(auth)).to match({
        first_name: 'Jos',
        last_name: 'Jossens',
        email: 'jos@josnet.com',
        remote_avatar_url: 'http://www.josnet.com/my-picture',
        locale: 'fr-FR'
      })
    end
  end
end
