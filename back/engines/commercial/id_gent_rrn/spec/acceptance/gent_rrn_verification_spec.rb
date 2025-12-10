# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require 'savon/mock/spec_helper'

resource 'Verifications' do
  explanation 'A Verifications is an attempt from a user to get verified'

  before do
    @user = create(:user)
    header_token_for @user
    header 'Content-Type', 'application/json'

    @custom_field = create(:custom_field_select)
    @cfo5 = create(:custom_field_option, custom_field: @custom_field)
    @cfo11 = create(:custom_field_option, custom_field: @custom_field)
    configuration = AppConfiguration.instance
    configuration.settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        {
          name: 'gent_rrn',
          api_key: 'fake_api_key',
          environment: 'qa',
          custom_field_key: @custom_field.key,
          wijk_mapping: {
            '5' => @cfo5.key,
            '11' => @cfo11.key
          }
        }
      ]
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
        stub_request(:get, "https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => true,
                                                                      'wijkNr' => '5' } }.to_json, headers: { 'Content-Type' => 'application/json' })

        do_request
        assert_status 201
        expect(@user.reload.verified).to be true
        expect(@user.verifications.first).to have_attributes({
          method_name: 'gent_rrn',
          user_id: @user.id,
          active: true,
          hashed_uid: '2a77e70b71b206c4c9dcf263250847b101180a8303938ed88caa8e60bb5a5fcf'
        })
        expect(@user.custom_field_values[@custom_field.key]).to eq @cfo5.key
      end
    end

    describe do
      let(:rrn) { '85-10-23-172.23 ' }

      example 'Verify with a valid rrn in non-normalized form' do
        stub_request(:get, 'https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/85102317223')
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => true,
                                                                      'wijkNr' => '15' } }.to_json, headers: { 'Content-Type' => 'application/json' })

        do_request
        assert_status 201
        expect(@user.reload.verified).to be true
        expect(@user.verifications.first).to have_attributes({
          method_name: 'gent_rrn',
          user_id: @user.id,
          active: true,
          hashed_uid: '2a77e70b71b206c4c9dcf263250847b101180a8303938ed88caa8e60bb5a5fcf'
        })
        expect(@user.custom_field_values[@custom_field.key]).to be_nil
      end
    end

    describe do
      let(:rrn) { '99071442848' }

      example '[error] Verify with a rrn of citizen not living in Ghent' do
        stub_request(:get, "https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => false,
                                                                      'redenNietGeldig' => ['ERR11'] } }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        assert_status 422
        expect(@user.reload.verified).to be false
        expect(@user.custom_field_values[@custom_field.key]).to be_nil
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'not_entitled', why: 'lives_outside')
      end
    end

    describe do
      let(:rrn) { '11010115780' }

      example '[error] Verify with a rrn of citizen less than 14 year old' do
        stub_request(:get, "https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => false,
                                                                      'redenNietGeldig' => ['ERR12'] } }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        assert_status 422
        expect(@user.reload.verified).to be false
        expect(@user.custom_field_values[@custom_field.key]).to be_nil
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'not_entitled', why: 'under_minimum_age')
      end
    end

    describe do
      let(:rrn) { '172639283' }

      example '[error] Verify with an invalid rrn' do
        do_request
        assert_status 422
        expect(@user.reload.verified).to be false
        expect(@user.custom_field_values[@custom_field.key]).to be_nil
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:rrn, 'invalid')
      end
    end

    describe do
      let(:rrn) { '85102311283' }

      example '[error] Verify with a non-matching rrn' do
        stub_request(:get, "https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => false,
                                                                      'redenNietGeldig' => ['ERR10'] } }.to_json, headers: { 'Content-Type' => 'application/json' })
        do_request
        assert_status 422
        expect(@user.reload.verified).to be false
        expect(@user.custom_field_values[@custom_field.key]).to be_nil
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'no_match')
      end
    end

    describe do
      before do
        other_user = create(:user)
        @rrn = '85102317223'
        stub_request(:get, "https://apidgqa.gent.be/services/wijkbudget/v1/WijkBudget/verificatie/#{rrn}")
          .to_return(status: 200, body: { 'verificatieResultaat' => { 'geldig' => true,
                                                                      'wijkNr' => '5' } }.to_json, headers: { 'Content-Type' => 'application/json' })
        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: 'gent_rrn',
          verification_parameters: { rrn: @rrn }
        )
      end

      let(:rrn) { @rrn }

      example '[error] Verify with an rrn that has already been taken' do
        do_request
        assert_status 422
        expect(@user.reload.verified).to be false
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:base, 'taken')
      end
    end
  end
end
