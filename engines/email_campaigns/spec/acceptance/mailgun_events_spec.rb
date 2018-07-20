require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Mailgun Events" do

  explanation "Endpoint that eceives webhook events from Mailgun"

  before do
    header "Content-Type", "application/json"
  end

  post "hooks/mailgun_events" do

    let(:campaigns_recipient) { create(:campaigns_recipient) }
    let(:mailgun_event) {{
      signature: {
        "timestamp"=>"1532087464", 
        "token"=>"19810be4e053736bc87ea4e047a722a1d50731d4df429b1baf", 
        "signature"=>"19317083e86d1be8e76337d3c92fd637279386a6a8cbfe3a8826915570599a9d"
      },
      :'event-data' => {
        event: 'opened',
        :'user-variables' => {
          cl_campaign_id: campaigns_recipient.campaign_id,
          cl_user_id: campaigns_recipient.user_id
        }
      }
    }}

    example "Receive a malgun event webhook" do
      do_request(mailgun_event)
      expect(response_status).to eq 200
      expect(campaigns_recipient.reload.delivery_status).to eq 'opened'
    end
  end

end