require 'rails_helper'

describe Seo::FacebookHandler do
  let(:app_id) { 'fake_app_id' }
  let(:app_secret) { 'fake_secret' }
  let(:access_token) { 'fake_access_token' }
  let(:service) { described_class.new(app_id, app_secret, access_token: access_token) }

  describe '#scrape' do
    it 'URL encodes the passed url in the API request' do
      stub_request(
        :post,
        'https://graph.facebook.com'
      )
        .with(query: hash_including({ 'id' => 'https%3A%2F%2Fsome.platform%2Fsome-page%3Fwith%3Dparams' }))
        .to_return(status: 200)

      service.scrape('https://some.platform/some-page?with=params')
    end
  end
end
