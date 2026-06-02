# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::Google::GoogleOmniauth do
  let(:google_method) { described_class.new }

  describe 'profile_to_user_attrs' do
    it 'correctly interprets gender, locale and image for google' do
      auth = OmniAuth::AuthHash.new(
        provider: 'google',
        info: {
          'first_name' => 'Jos',
          'last_name' => 'Jossens',
          'email' => 'jos@josnet.com',
          'image' => 'http://www.josnet.com/my-picture'
        },
        extra: {
          raw_info: {
            gender: 'female',
            locale: 'fr-FR'
          }
        }
      )

      expect(google_method).to receive(:image_available?).and_return(true)
      user_attrs = google_method.profile_to_user_attrs(auth)

      expect(user_attrs).to include({
        locale: 'fr-FR',
        gender: 'female',
        remote_avatar_url: 'http://www.josnet.com/my-picture'
      })
    end
  end
end
