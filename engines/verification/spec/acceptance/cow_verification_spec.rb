require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Verifications" do
 
  explanation "A Verifications is an attempt from a user to get verified"

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @tenant = Tenant.current
    settings = @tenant.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{name: 'cow'}],
    }
    @tenant.save!
  end

  post "web_api/v1/verification_methods/cow/verification" do
    with_options scope: :verification do
      parameter :run, "The RUN number of the citizen", required: true
      parameter :id_serial, "The ID card serial number of the citizen", required: true
    end

    let(:run) { "12.025.365-6" }
    let(:id_serial) { "A001529382" }

    example_request "Verify with cow" do
      expect(status).to eq(201)
      expect(@user.reload.verified).to be true
      expect(@user.verifications.first).to have_attributes({
        method_name: "cow",
        user_id: @user.id,
        active: true,
        hashed_uid: '7c18cce107584e83c4e3a5d5ed336134dd3844bf0b5fcfd7c82a9877709a2654'
      })
    end

    describe do
      let(:run) { "11.111.111-1" }
      let(:id_serial) { "A001529382" }
      example_request "[error] Verify with cow without a match" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({:errors => {:base=>[{:error=>"no_match"}]}})
      end
    end

    describe do
      let(:run) { "125.326.452-1" }
      let(:id_serial) { "A001529382" }
      example_request "[error] Verify with cow using invalid run" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({:errors => {:run=>[{:error=>"invalid"}]}})
      end
    end

    describe do
      let(:run) { "12.025.365-6" }
      let(:id_serial) { "" }
      example_request "[error] Verify with cow using invalid id_serial" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({:errors => {:id_serial=>[{:error=>"invalid"}]}})
      end
    end

    describe do
      before do
        other_user = create(:user)
        @run = "12.025.365-6"
        @id_serial = "A001529382"
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: "cow",
          verification_parameters: {run: @run, id_serial: @id_serial}
        )
      end
      let(:run) { @run }
      let(:id_serial) { @id_serial }
      example_request "[error] Verify with cow using credentials that are already taken" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({:errors => {:base=>[{:error=>"taken"}]}})
      end
    end
  end

end
