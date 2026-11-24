# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth do
  describe '#logout_url' do
    it 'signs the user out at ClaveUnica and redirects back to the platform' do
      url = described_class.new.logout_url(create(:user))

      expect(url).to eq(
        "https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout?#{{ redirect: Frontend::UrlService.new.home_url }.to_query}"
      )
    end
  end
end
