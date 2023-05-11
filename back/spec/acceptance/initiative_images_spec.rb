# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InitiativeImage' do
  explanation 'Initiatives can have mutliple images.'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
    @initiative = create(:initiative, author: @user)
    create_list(:initiative_image, 2, initiative: @initiative)
  end

  get 'web_api/v1/initiatives/:initiative_id/images' do
    let(:initiative_id) { @initiative.id }

    example_request 'List all images of an initiative' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/initiatives/:initiative_id/images/:image_id' do
    let(:initiative_id) { @initiative.id }
    let(:image_id) { InitiativeImage.first.id }

    example_request 'Get one image of an initiative by id' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/images' do
    with_options scope: :image do
      parameter :image, 'The base64 encoded image', required: true
      parameter :ordering, 'An integer that is used to order the images within an initiative', required: false
    end
    ValidationErrorHelper.new.error_fields(self, InitiativeImage)

    let(:initiative_id) { @initiative.id }
    let(:image) { png_image_as_base64 'image13.png' }
    let(:ordering) { 1 }

    example_request 'Add an image to an initiative' do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(1)
    end
  end

  patch 'web_api/v1/initiatives/:initiative_id/images/:image_id' do
    with_options scope: :image do
      parameter :image, 'The base64 encoded image'
      parameter :ordering, 'An integer that is used to order the images within an initiative'
    end
    ValidationErrorHelper.new.error_fields(self, InitiativeImage)

    let(:initiative_id) { @initiative.id }
    let(:image_id) { InitiativeImage.first.id }
    let(:image) { png_image_as_base64 'image14.png' }
    let(:ordering) { 2 }

    example_request 'Update an image for an initiative' do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      expect(json_response.dig(:data, :attributes, :ordering)).to eq(2)
    end
  end

  delete 'web_api/v1/initiatives/:initiative_id/images/:image_id' do
    let(:initiative_id) { @initiative.id }
    let(:image_id) { InitiativeImage.first.id }

    example_request 'Delete an image from an initiative' do
      expect(response_status).to eq 200
      expect { InitiativeImage.find(image_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
