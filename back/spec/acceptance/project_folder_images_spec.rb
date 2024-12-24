# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFolderImage' do
  explanation 'ProjectFolders can have mutliple images.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
    @project_folder = create(:project_folder)
    create_list(:project_folder_image, 2, project_folder: @project_folder)
  end

  get 'web_api/v1/project_folders/:project_folder_id/images' do
    let(:project_folder_id) { @project_folder.id }

    example_request 'List all images of a project_folder' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/project_folders/:project_folder_id/images/:image_id' do
    let(:project_folder_id) { @project_folder.id }
    let(:image_id) { ProjectFolders::Image.first.id }

    example_request 'Get one image of a project_folder' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small large]
    end
  end

  post 'web_api/v1/project_folders/:project_folder_id/images' do
    with_options scope: :image do
      parameter :image, 'The base64 encoded image', required: true
      parameter :ordering, 'An integer that is used to order the images within a project_folder', required: false
      parameter :alt_text_multiloc, 'The alt text in multiple locales', required: false
    end
    ValidationErrorHelper.new.error_fields(self, ProjectFolders::Image)
    let(:project_folder_id) { @project_folder.id }
    let(:image) { png_image_as_base64 'image13.png' }
    let(:ordering) { 1 }
    let(:alt_text_multiloc) { { 'en' => 'A cute puppy' } }

    example_request 'Add an image to a project_folder' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small large]
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(1)
      expect(json_response.dig(:data, :attributes, :alt_text_multiloc).stringify_keys).to match alt_text_multiloc
    end

    describe do
      let(:ordering) { 'five' }
      let(:image) { nil }

      example_request '[error] Add an invalid image to a project_folder' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:ordering, 'not_a_number', value: 'five')
      end
    end

    describe do
      let(:image) { file_as_base64 'afvalkalender.pdf', 'application/pdf' }

      example_request '[error] Add an invalid image type to a project_folder' do
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:image, 'extension_whitelist_error')
      end
    end
  end

  patch 'web_api/v1/project_folders/:project_folder_id/images/:image_id' do
    with_options scope: :image do
      parameter :image, 'The base64 encoded image'
      parameter :ordering, 'An integer that is used to order the images within a project_folder'
      parameter :alt_text_multiloc, 'The updated alt text in multiple locales', required: false
    end
    ValidationErrorHelper.new.error_fields(self, ProjectFolders::Image)
    let(:project_folder_id) { @project_folder.id }
    let(:image_id) { ProjectFolders::Image.first.id }
    let(:image) { png_image_as_base64 'image14.png' }
    let(:ordering) { 2 }
    let(:alt_text_multiloc) { { 'en' => 'A cute puppy' } }

    example_request 'Edit an image for a project_folder' do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small large]
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(2)
      expect(json_response.dig(:data, :attributes, :alt_text_multiloc).stringify_keys).to match alt_text_multiloc
    end
  end

  delete 'web_api/v1/project_folders/:project_folder_id/images/:image_id' do
    let(:project_folder_id) { @project_folder.id }
    let(:image_id) { ProjectFolders::Image.first.id }

    example_request 'Delete an image from a project_folder' do
      expect(response_status).to eq 200
      expect { ProjectFolders::Image.find(image_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
