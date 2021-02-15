require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Verifications" do

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'id_card_lookup',
        method_name_multiloc: { en: 'By social security number' },
        card_id_multiloc: { en: 'Social security number' },
        card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' },
        card_id_placeholder: "xx-xxxxx-xx",
        explainer_image_url: "https://some.fake/image.png"
      }],
    }
    configuration.save!
  end

  post "web_api/v1/verification_methods/id_card_lookup/verification" do
    with_options scope: :verification do
      parameter :card_id
    end

    describe do
      before do
        @card_id = "123.46234-78B"
        id_card = create(:verification_id_card, card_id: @card_id)
      end
      let(:card_id) { @card_id }
      example_request "Verify with id_card_lookup" do
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
      end
    end

    describe do
      let(:card_id) { "234.532345-345" }
      example_request "[error] Verify with id_card_lookup without a match" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "no_match" }] } })
      end
    end

    describe do
      let(:card_id) { "" }
      example_request "[error] Verify with id_card_lookup using empty card_id" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :card_id => [{ :error => "invalid" }] } })
      end
    end

    describe do
      before do
        other_user = create(:user)
        @card_id = "123.46234-78B"
        id_card = create(:verification_id_card, card_id: @card_id)
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: "id_card_lookup",
          verification_parameters: { card_id: @card_id }
        )
      end
      let(:card_id) { "123.4623478B" }
      example_request "[error] Verify with id_card_lookup using credentials that are already taken (2nd call)" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "taken" }] } })
      end
    end
  end

end
