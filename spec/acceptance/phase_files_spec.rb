require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "PhaseFile" do

  explanation "File attachments."

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    @project = create(:project)
    @phase = create(:phase, project: @project)
    create_list(:phase_file, 2, phase: @phase)
  end

  get "web_api/v1/phases/:phase_id/files" do
    let(:phase_id) { @phase.id }

    example_request "List all file attachments of a phase" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/phases/:phase_id/files/:file_id" do
    let(:phase_id) { @phase.id }
    let(:file_id) { PhaseFile.first.id }

    example_request "Get one file of a phase" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:file)).to be_present
    end
  end

  post "web_api/v1/phases/:phase_id/files" do
    with_options scope: :file do
      parameter :file, "The base64 encoded file", required: true
      parameter :ordering, "An integer that is used to order the file attachments within a phase", required: false
      parameter :name, "The name of the file, including the file extension", required: true
    end
    ValidationErrorHelper.new.error_fields(self, PhaseFile)
    let(:phase_id) { @phase.id }
    let(:ordering) { 1 }
    let(:name) { "afvalkalender.pdf" }
    let(:file) { encode_pdf_file_as_base64(name) }

    example_request "Add a file attachment to a phase" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:file)).to be_present
      expect(json_response.dig(:data,:attributes,:ordering)).to eq(1)
      expect(json_response.dig(:data,:attributes,:name)).to eq(name)
      expect(json_response.dig(:data,:attributes,:size)).to be_present
    end

    describe do
      let(:file) { encode_exe_file_as_base64("keylogger.exe") }

      example_request "[error] Add an unsupported file extension as attachment to a phase" do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:file)).to include({:error=>"extension_whitelist_error"})
      end
    end
  end

  patch "web_api/v1/phases/:phase_id/files/:file_id" do
    with_options scope: :file do
      parameter :file, "The base64 encoded file"
      parameter :ordering, "An integer that is used to order the file attachments within a phase"
      parameter :name, "The name of the file, including the file extension"
    end
    ValidationErrorHelper.new.error_fields(self, PhaseFile)
    let(:phase_id) { @phase.id }
    let(:file_id) { PhaseFile.first.id }
    let(:name) { 'ophaalkalender.pdf' }
    let(:ordering) { 2 }

    example_request "Edit a file attachment for a phase" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:name)).to eq(name)
      expect(json_response.dig(:data,:attributes,:ordering)).to eq(2)
    end
  end

  delete "web_api/v1/phases/:phase_id/files/:file_id" do
    let(:phase_id) { @phase.id }
    let(:file_id) { PhaseFile.first.id }

    example_request "Delete a file attachment from a phase" do
      expect(response_status).to eq 200
      expect{PhaseFile.find(file_id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end


  private

  def encode_pdf_file_as_base64 filename
    "data:application/pdf;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end

  def encode_exe_file_as_base64 filename
    "data:application/octet-stream;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end

  def encode_image_as_base64 filename
    "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end

end