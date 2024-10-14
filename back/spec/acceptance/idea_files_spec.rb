# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'IdeaFile' do
  explanation 'File attachments.'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
    @project = create(:single_phase_ideation_project)
    @idea = create(:idea, author: @user, project: @project)
    create_list(:idea_file, 2, idea: @idea)
  end

  get 'web_api/v1/ideas/:idea_id/files' do
    let(:idea_id) { @idea.id }

    example_request 'List all file attachments of an idea' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/ideas/:idea_id/files/:file_id' do
    let(:idea_id) { @idea.id }
    let(:file_id) { IdeaFile.first.id }

    example_request 'Get one file attachment of an idea by id' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :file)).to be_present
    end
  end

  patch 'web_api/v1/ideas/:idea_id/files/:file_id' do
    with_options scope: :file do
      parameter :ordering, 'An integer to update the order of the file attachments', required: false
    end

    let(:idea_id) { @idea.id }
    let(:file_id) { IdeaFile.first.id }
    let(:ordering) { 3 }

    example_request 'Update the ordering of a file attachment' do
      do_request(ordering: ordering)
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(3)
    end
  end

  post 'web_api/v1/ideas/:idea_id/files' do
    with_options scope: :file do
      parameter :file, 'The base64 encoded file', required: true
      parameter :name, 'The name of the file, including the file extension', required: true
      parameter :ordering, 'An integer that is used to order the files within an idea', required: false
    end
    ValidationErrorHelper.new.error_fields(self, IdeaFile)
    let(:idea_id) { @idea.id }
    let(:file) { encode_file_as_base64('afvalkalender.pdf') }
    let(:ordering) { 1 }
    let(:name) { 'afvalkalender.pdf' }

    example_request 'Add a file attachment to an idea' do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :file)).to be_present
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(1)
      expect(json_response.dig(:data, :attributes, :name)).to eq(name)
    end
  end

  delete 'web_api/v1/ideas/:idea_id/files/:file_id' do
    let(:idea_id) { @idea.id }
    let(:file_id) { IdeaFile.first.id }

    example_request 'Delete a file attachment from an idea' do
      expect(response_status).to eq 200
      expect { IdeaFile.find(file_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  private

  def encode_file_as_base64(filename)
    "data:application/pdf;base64,#{Base64.encode64(Rails.root.join('spec', 'fixtures', filename).read)}"
  end
end
