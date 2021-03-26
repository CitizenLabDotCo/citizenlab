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
      verification_methods: [{ name: 'bogus' }],
    }
    create(:custom_field, key: 'gender')
    configuration.save!
  end

  post "web_api/v1/verification_methods/bogus/verification" do
    with_options scope: :verification do
      parameter :desired_error, "Let's you fake errors. Pick your flavour: no_match, not_entitled, taken. Leave empty for success.", required: false
    end

    describe do
      let(:desired_error) { nil }
      example_request "Fake verify with bogus" do
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
        expect(@user.last_name).to eq "BOGUS"
        expect(@user.custom_field_values["gender"]).to eq "female"
      end
    end

    describe do
      let(:desired_error) { nil }
      before do
        @user.update(registration_completed_at: nil)
      end
      example_request "Fake verify with bogus for a user that didn't complete her registation yet" do
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
        expect(@user.last_name).to eq "BOGUS"
        expect(@user.custom_field_values["gender"]).to eq "female"
      end
    end

    describe do
      let(:desired_error) { "no_match" }
      example_request "[error] Fake verify with bogus without a match" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "no_match" }] } })
      end
    end

    describe do
      let(:desired_error) { "not_entitled" }
      example_request "[error] Fake verify with bogus with a match that's not entitled to verification" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "not_entitled" }] } })
      end
    end

    describe do
      let(:desired_error) { "any_none_suported_value" }
      example_request "[error] Fake verify with bogus using invalid desired_error" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :desired_error => [{ :error => "invalid" }] } })
      end
    end

    describe do
      before do
        other_user = create(:user)
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: "bogus",
          verification_parameters: { desired_error: "taken" }
        )
      end
      let(:desired_error) { "taken" }
      example_request "[error] Fake verify with bogus using credentials that are already taken (2nd call)" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "taken" }] } })
      end
    end
  end

end
