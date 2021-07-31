require 'rails_helper'
require 'rspec_api_documentation/dsl'
require 'savon/mock/spec_helper'

resource 'Verifications' do
  explanation 'A Verifications is an attempt from a user to get verified'

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header 'Content-Type', 'application/json'
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{ name: 'gent_rrn', api_key: 'fake_api_key' }]
    }
    configuration.save!
  end

  post 'web_api/v1/verification_methods/gent_rrn/verification' do
    with_options scope: :verification do
      parameter :rrn, 'The rrn (rijksregister nummer) the user wants to validate their identity with', required: true
    end

    describe do
      let(:rrn) { '85102317223' }

      example 'Verify with a valid rrn' do
        stub_request(:get, "https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: {
            'rrn' => '85102317223',
            'isValid' => true,
            'wijkNr' => '5',
            'ErrCodes' => []
          }.to_json, headers: { 'Content-Type' => 'application/json' })

        do_request
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
        expect(@user.verifications.first).to have_attributes({
                                                               method_name: 'gent_rrn',
                                                               user_id: @user.id,
                                                               active: true,
                                                               hashed_uid: '2a77e70b71b206c4c9dcf263250847b101180a8303938ed88caa8e60bb5a5fcf'
                                                             })
      end
    end

    describe do
      let(:rrn) { '85-10-23-172.23 ' }

      example 'Verify with a valid rrn in non-normalized form' do
        stub_request(:get, 'https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/85102317223')
          .to_return(status: 200, body: {
            'rrn' => '85102317223',
            'isValid' => true,
            'wijkNr' => '5',
            'ErrCodes' => []
          }.to_json, headers: { 'Content-Type' => 'application/json' })

        do_request
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
        expect(@user.verifications.first).to have_attributes({
                                                               method_name: 'gent_rrn',
                                                               user_id: @user.id,
                                                               active: true,
                                                               hashed_uid: '2a77e70b71b206c4c9dcf263250847b101180a8303938ed88caa8e60bb5a5fcf'
                                                             })
      end
    end

    describe do
      let(:rrn) { '82110750220' }

      example '[error] Verify with a rrn of citizen not living in Ghent' do
        stub_request(:get, "https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: {
            "rrn": '82110750220',
            "isValid": true,
            "wijkNr": '24',
            "ErrCodes": ['ERR11']
          }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        expect(status).to eq(422)
        expect(@user.reload.verified).to be false
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'not_entitled' }] } })
      end
    end

    describe do
      let(:rrn) { '11010115780' }

      example '[error] Verify with a rrn of citizen less than 14 year old' do
        stub_request(:get, "https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: {
            "rrn": '11010115780',
            "isValid": false,
            "wijkNr": '',
            "ErrCodes": ['ERR12']
          }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        expect(status).to eq(422)
        expect(@user.reload.verified).to be false
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'not_entitled' }] } })
      end
    end

    describe do
      let(:rrn) { '172639283' }

      example '[error] Verify with an invalid rrn' do
        do_request
        expect(status).to eq(422)
        expect(@user.reload.verified).to be false
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { rrn: [{ error: 'invalid' }] } })
      end
    end

    describe do
      let(:rrn) { '85102317223' }

      example '[error] Verify with a non-matching rrn' do
        stub_request(:get, "https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: {
            "rrn": '85102317223',
            "isValid": false,
            "wijkNr": '',
            "ErrCodes": []
          }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        expect(status).to eq(422)
        expect(@user.reload.verified).to be false
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'no_match' }] } })
      end
    end

    describe do
      before do
        other_user = create(:user)
        @rrn = '85102317223'
        stub_request(:get, "https://unknown.domain/services/wijkbudget-api/v1/api/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: {
            'rrn' => '85102317223',
            'isValid' => true,
            'wijkNr' => '5',
            'ErrCodes' => []
          }.to_json, headers: { 'Content-Type' => 'application/json' })
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: 'gent_rrn',
          verification_parameters: { rrn: @rrn }
        )
      end

      let(:rrn) { @rrn }

      example '[error] Verify with an rrn that has already been taken' do
        do_request
        expect(status).to eq(422)
        expect(@user.reload.verified).to be false
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'taken' }] } })
      end
    end
  end
end
