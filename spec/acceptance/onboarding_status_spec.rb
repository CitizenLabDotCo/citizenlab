require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Onboarding status" do

  explanation "Indicates which call to action to show to the current user"

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "web_api/v1/onboarding_status" do

    response_field :status, "One of #{OnboardingService::STATUSES.join(' or ')}", scope: :attributes

    context "for a user with an incomplete profile" do
      example_request "Get the onboarding status" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:status]).to eq 'complete_profile'
        expect(json_response[:data][:attributes][:cta_message_multiloc]).to be_nil
        expect(json_response[:data][:attributes][:cta_button_multiloc]).to be_nil
        expect(json_response[:data][:attributes][:cta_button_link]).to be_nil
      end
    end

    context "for a user with a complete profile" do
      before do
        @user.update(bio_multiloc: {en: 'I love scrabble'})
        t = Tenant.current
        t.settings['core']['custom_onboarding_message'] = {
          en: "Dance like noone is watching"
        }
        t.settings['core']['custom_onboarding_button'] = {
          en: "Click here"
        }
        t.settings['core']['custom_onboarding_link'] = "/ideas"
        t.save
      end
      example "Get the onboarding status for a user with a complete profile" do
        do_request
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:status]).to eq 'custom_cta'
        expect(json_response[:data][:attributes][:cta_message_multiloc][:en]).to eq "Dance like noone is watching"
        expect(json_response[:data][:attributes][:cta_button_multiloc][:en]).to eq "Click here"
        expect(json_response[:data][:attributes][:cta_button_link]).to eq "/ideas"
      end
    end
  end

end
