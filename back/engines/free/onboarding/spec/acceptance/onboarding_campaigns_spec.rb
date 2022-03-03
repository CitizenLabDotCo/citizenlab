require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Onboarding campaigns" do

  explanation "Indicates which call to action to show to the current user"

  before do
    @user = create(:user, verified: true)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "web_api/v1/onboarding_campaigns/current" do

    response_field :name, "One of #{Onboarding::OnboardingService.campaigns.join(' or ')}", scope: :attributes

    context "for a user with an incomplete profile" do
      example_request "Get the current onboarding campaign" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:name]).to eq 'complete_profile'
        expect(json_response[:data][:attributes][:cta_message_multiloc]).to be_nil
        expect(json_response[:data][:attributes][:cta_button_multiloc]).to be_nil
        expect(json_response[:data][:attributes][:cta_button_link]).to be_nil
      end
    end

    context "for a user with a complete profile" do
      before do
        @user.update(bio_multiloc: {en: 'I love scrabble'})
        AppConfiguration.instance.tap do |cfg|
          cfg.settings['core']['custom_onboarding_message'] = { en: "Dance like noone is watching" }
          cfg.settings['core']['custom_onboarding_button'] = { en: "Click here" }
          cfg.settings['core']['custom_onboarding_link'] = "/ideas"
        end.save
      end

      example "Get the current onboarding campaign for a user with a complete profile" do
        do_request
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:name]).to eq 'custom_cta'
        expect(json_response[:data][:attributes][:cta_message_multiloc][:en]).to eq "Dance like noone is watching"
        expect(json_response[:data][:attributes][:cta_button_multiloc][:en]).to eq "Click here"
        expect(json_response[:data][:attributes][:cta_button_link]).to eq "/ideas"
      end
    end

    context "for a not signed-in user" do
      before do
        header 'Authorization', nil
      end

      example_request "[error] returns 401 Unauthorized response" do
        expect(status).to eq(401)
      end
    end
  end

  post "web_api/v1/onboarding_campaigns/:campaign_name/dismissal" do
    context "for a user with an incomplete profile" do
      let (:campaign_name) { 'complete_profile' }

      describe "the first time" do
        example_request "Create an onboarding campaign dismissal" do
          expect(status).to eq 200
        end
      end

      context "a campaign was dismissed before" do
        before do
          Onboarding::CampaignDismissal.create(campaign_name: campaign_name, user: @user)
        end

        example_request "[error] Create an onboarding campaign dismissal for the same campaign twice" do
          expect(status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response[:errors]).to match({:campaign_name=>[{:error=>"taken", :value=>"complete_profile"}]})
        end
      end
    end
  end

end
