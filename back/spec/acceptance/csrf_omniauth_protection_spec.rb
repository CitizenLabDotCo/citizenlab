require 'rails_helper'

# Make sure that https://nvd.nist.gov/vuln/detail/CVE-2015-9284 is mitigated
RSpec.describe 'CVE-2015-9284', type: :request do
  describe 'GET /auth/:provider/callback' do
    it do
      get '/auth/google/callback'
      expect(response).not_to have_http_status(:redirect)
    end
  end

  describe 'POST /auth/:provider/callback without CSRF token' do
    before do
      @allow_forgery_protection = ActionController::Base.allow_forgery_protection
      ActionController::Base.allow_forgery_protection = true
    end

    it do
      expect {
        post '/auth/google/callback'
      }.to raise_error(ActionController::InvalidAuthenticityToken)
    end

    after do
      ActionController::Base.allow_forgery_protection = @allow_forgery_protection
    end
  end
end