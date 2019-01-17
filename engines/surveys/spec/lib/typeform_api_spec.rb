require "rails_helper"

describe Surveys::Typeform::Api do

  let(:token) { 'DHsJNboURuCdUpi5oLeLGFr1D9wpuu1xyaWTX5H55v2p' }
  let(:api) { Surveys::Typeform::Api.new(token) }
  let(:form_id) { "USLYB6" }
  let(:webhook_url) { "http://some.fake.url/hooks/typeform" }

  describe "webhooks" do
    it "returns the webhooks" do
      stub_request(:get, "https://api.typeform.com/forms/#{form_id}/webhooks")
        .with(headers: {
          'Authorization' => "Bearer #{token}"
        })
        .to_return(status: 200, body: '{"items": []}', headers: {"Content-Type" => "application/json"})

      response = api.webhooks(form_id)
      expect(response.success?).to be true
      expect(response.parsed_response).to eq ({"items"=>[]})
    end
  end

  describe "create_or_update_webhook" do
    it "creates a webhooks" do
      stub_request(:put, "https://api.typeform.com/forms/#{form_id}/webhooks/test-hook")
        .with(
           body: "{\"url\":\"#{webhook_url}\",\"enabled\":true}",
           headers: {
            'Authorization'=>"Bearer #{token}",
            'Content-Type'=>'application/json'
           }
         )
        .to_return(
          status: 200,
          body: '{"created_at": "2019-01-17T13:55:57.391777Z", "enabled": true, "form_id": "USLYB6", "id": "01D1E1HMTEYSY2XVDPZTYVT823", "tag": "test-hook", "updated_at": "2019-01-17T13:58:33.45316Z", "url": "http://some.fake.url/hooks/typeform", "verify_ssl": false}',
          headers: {"Content-Type" => "application/json"}
        )

      response = api.create_or_update_webhook(form_id: form_id, tag: 'test-hook', url: webhook_url)
      expect(response.success?).to be true
      expect(response.parsed_response).to eq ({
        "url" => webhook_url,
        "enabled" => true,
        "created_at" => "2019-01-17T13:55:57.391777Z",
        "form_id" => form_id,
        "id" => "01D1E1HMTEYSY2XVDPZTYVT823",
        "tag" => "test-hook",
        "updated_at" => "2019-01-17T13:58:33.45316Z",
        "verify_ssl" => false,
      })
    end
  end

  describe "delete_webhook" do
    it "deletes a webhook" do
      stub_request(:delete, "https://api.typeform.com/forms/#{form_id}/webhooks/test-hook")
        .with(
           headers: {
            'Authorization'=>"Bearer #{token}",
           }
         )
         .to_return(status: 204, body: "", headers: {})

      response = api.delete_webhook(form_id: form_id, tag: 'test-hook')
      expect(response.success?).to be true
    end
  end


end