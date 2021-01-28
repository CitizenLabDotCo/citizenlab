require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "ProjectFolderFile" do

  explanation "File attachments."

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    @folder = create(:project_folder)
    create_list(:project_folder_file, 2, project_folder: @folder)
  end

  get "web_api/v1/project_folders/:folder_id/files" do
    let(:folder_id) { @folder.id }

    example_request "List all file attachments of a folder" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/project_folders/:folder_id/files/:file_id" do
    let(:folder_id) { @folder.id }
    let(:file_id) { ProjectFolders::File.first.id }

    example_request "Get one file of a folder" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:file)).to be_present
    end
  end

  post "web_api/v1/project_folders/:folder_id/files" do
    with_options scope: :file do
      parameter :file, "The base64 encoded file", required: true
      parameter :name, "The name of the file, including the file extension", required: true
      parameter :ordering, "An integer that is used to order the file attachments within a folder", required: false
    end
    ValidationErrorHelper.new.error_fields(self, ProjectFolders::File)
    let(:folder_id) { @folder.id }
    let(:ordering) { 1 }
    let(:name) { "afvalkalender.pdf" }
    let(:file) { encode_pdf_file_as_base64(name) }

    example_request "Add a file attachment to a folder" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:file)).to be_present
      expect(json_response.dig(:data,:attributes,:ordering)).to eq(1)
      expect(json_response.dig(:data,:attributes,:name)).to eq(name)
      expect(json_response.dig(:data,:attributes,:size)).to be_present
    end

    describe do
      let(:file) { encode_exe_file_as_base64("keylogger.exe") }
      let(:name) { "keylogger.exe" }

      example_request "[error] Add an unsupported file extension as attachment to a folder" do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:file)).to include({:error=>"extension_whitelist_error"})
      end
    end

    describe do
      example "[error] Add a file of which the size is too large" do
        # mock the size_range method of ProjectFolderFileUploader to have 3 bytes as maximum size
        expect_any_instance_of(ProjectFolders::FileUploader).to receive(:size_range).and_return(1..3)

        do_request
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:file)).to include({:error=>"max_size_error"})
      end
    end
  end

  delete "web_api/v1/project_folders/:folder_id/files/:file_id" do
    let(:folder_id) { @folder.id }
    let(:file_id) { ProjectFolders::File.first.id }

    example_request "Delete a file attachment from a folder" do
      expect(response_status).to eq 200
      expect{ProjectFolders::File.find(file_id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end


  private

  def encode_pdf_file_as_base64 filename
    "data:application/pdf;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end

  def encode_exe_file_as_base64 filename
    "data:application/octet-stream;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
  end

end