# frozen_string_literal: true

require 'rails_helper'

describe IdGoogle::GoogleOmniauth do
  describe 'profile_to_user_attrs' do
    it 'correctly interprets gender, locale and image for google' do
      auth = OpenStruct.new({
        provider: 'google',
        info: OpenStruct.new({
          'first_name' => 'Jos',
          'last_name' => 'Jossens',
          'email' => 'jos@josnet.com',
          'image' => 'http://www.josnet.com/my-picture'
        }),
        extra: OpenStruct.new({
          raw_info: OpenStruct.new({
            gender: 'female',
            locale: 'fr-FR'
          })
        })
      })

      expect(subject).to receive(:image_available?).and_return(true)
      user_attrs = subject.profile_to_user_attrs(auth)

      expect(user_attrs).to include({
        locale: 'fr-FR',
        gender: 'female',
        remote_avatar_url: 'http://www.josnet.com/my-picture'
      })
    end
  end
end
