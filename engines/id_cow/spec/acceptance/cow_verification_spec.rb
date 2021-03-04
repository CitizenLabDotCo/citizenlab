require 'rails_helper'
require 'rspec_api_documentation/dsl'
require 'savon/mock/spec_helper'

resource "Verifications" do

  explanation "A Verifications is an attempt from a user to get verified"
  include Savon::SpecHelper

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
      verification_methods: [{ name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' }],
    }
    configuration.save!
  end

  post "web_api/v1/verification_methods/cow/verification" do
    with_options scope: :verification do
      parameter :run, "The RUN number of the citizen", required: true
      parameter :id_serial, "The ID card serial number of the citizen", required: true
    end

    before do
      stub_request(:get, "https://terceros.sidiv.registrocivil.cl:8443/InteroperabilityPlateform/TercerosCOWProxyService?wsdl")
        .to_return(status: 200, body: File.read("engines/verification/spec/fixtures/cow_wsdl.xml"), headers: {})
      savon.mock!
    end
    after do
      savon.unmock!
    end

    # Uncomment this and fill out the credentials to do a real, non-mocked test
    #
    # describe do
    #   before do
    #     configuration = AppConfiguration.instance
    #     settings = configuration.settings
    #     settings['verification'] = {
    #       allowed: true,
    #       enabled: true,
    #       verification_methods: [{
    #         name: 'cow',
    #         api_username:'usr_im_penalolen_01',
    #         api_password: 'realpasswordhere',
    #         rut_empresa: 'realempresahere'
    #       }],
    #     }
    #     configuration.save!
    #     savon.unmock!
    #   end
    #   let(:run) { "14.533.402-0" }
    #   let(:id_serial) { "518.137.850" }
    #   example_request "Verify with cow for real" do
    #     expect(status).to eq(201)
    #     expect(@user.reload.verified).to be true
    #     expect(@user.verifications.first).to have_attributes({
    #       method_name: "cow",
    #       user_id: @user.id,
    #       active: true,
    #       hashed_uid: '6260dc3f1756c9f3aa431798d855a98c4383ba64c73fd3e87e47f839fc7f112e'
    #     })
    #   end
    # end

    describe do
      let(:run) { "12.025.365-6" }
      let(:id_serial) { "A001529382" }
      example "Verify with cow" do
        savon.expects(:get_data_document)
             .with(message: {
               "typens:RUTEmpresa" => 'fake_rut_empresa',
               "typens:DVEmpresa" => 'k',
               "typens:CodTipoDocumento" => 'C',
               "typens:NumRUN" => '12025365',
               "typens:NumSerie" => 'A001529382',
             })
             .returns(File.read("engines/verification/spec/fixtures/get_data_document_match.xml"))
        do_request
        expect(status).to eq(201)
        expect(@user.reload.verified).to be true
        expect(@user.verifications.first).to have_attributes({
          method_name: "cow",
          user_id: @user.id,
          active: true,
          hashed_uid: '6a35b8e317fad56c885efc7397d8c14b6c4008f549abc5ae27222e8b2e3380c5'
        })
      end
    end

    describe do
      let(:run) { "11.111.111-1" }
      let(:id_serial) { "A001529382" }
      example "[error] Verify with cow without a match" do
        savon.expects(:get_data_document)
             .with(message: {
               "typens:RUTEmpresa" => 'fake_rut_empresa',
               "typens:DVEmpresa" => 'k',
               "typens:CodTipoDocumento" => 'C',
               "typens:NumRUN" => '11111111',
               "typens:NumSerie" => 'A001529382',
             })
             .returns(File.read("engines/verification/spec/fixtures/get_data_document_no_match.xml"))
        do_request
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "no_match" }] } })
      end
    end

    describe do
      let(:run) { "11.111.111-1" }
      let(:id_serial) { "A.001.529.382" }
      example "[error] Verify with cow with a match that's not entitled to verification" do
        savon.expects(:get_data_document)
             .with(message: {
               "typens:RUTEmpresa" => 'fake_rut_empresa',
               "typens:DVEmpresa" => 'k',
               "typens:CodTipoDocumento" => 'C',
               "typens:NumRUN" => '11111111',
               "typens:NumSerie" => 'A001529382',
             })
             .returns(File.read("engines/verification/spec/fixtures/get_data_document_match_no_citizen.xml"))
        do_request
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "not_entitled" }] } })
      end
    end

    describe do
      let(:run) { "125.326.452-1" }
      let(:id_serial) { "A001529382" }
      example_request "[error] Verify with cow using invalid run" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :run => [{ :error => "invalid" }] } })
      end
    end

    describe do
      let(:run) { "12.025.365-6" }
      let(:id_serial) { "" }
      example_request "[error] Verify with cow using invalid id_serial" do
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :id_serial => [{ :error => "invalid" }] } })
      end
    end

    describe do
      before do
        other_user = create(:user)
        @run = "12.025.365-6"
        @id_serial = "A001529382"
        savon.expects(:get_data_document)
             .with(message: :any)
             .returns(File.read("engines/verification/spec/fixtures/get_data_document_match.xml"))

        Verification::VerificationService.new.verify_sync(
          user: other_user,
          method_name: "cow",
          verification_parameters: { run: @run, id_serial: @id_serial }
        )
      end
      let(:run) { @run }
      let(:id_serial) { @id_serial }
      example "[error] Verify with cow using credentials that are already taken" do
        savon.expects(:get_data_document)
             .with(message: :any)
             .returns(File.read("engines/verification/spec/fixtures/get_data_document_match.xml"))
        do_request
        expect(status).to eq (422)
        json_response = json_parse(response_body)
        expect(json_response).to eq ({ :errors => { :base => [{ :error => "taken" }] } })
      end
    end
  end

end
