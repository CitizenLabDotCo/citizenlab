# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CustomFieldOptionImage' do
  explanation 'Events can have multiple images.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'as a visitor' do
    get 'web_api/v1/custom_field_option_images/:image_id' do
      let(:image_id) { create(:custom_field_option_image).id }

      example_request 'Get a CustomFieldOptionImage' do
        expect(response_status).to eq 200
        expect(json_response_body.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      end
    end
  end

  context 'as an admin' do
    before do
      header_token_for create(:admin)
    end

    post 'web_api/v1/custom_field_option_images' do
      with_options scope: :image do
        parameter :image, 'The base64 encoded image', required: true
      end
      let(:image) { png_image_as_base64 'image13.jpg' }

      example_request 'Add a CustomFieldOptionImage without an associated option' do
        expect(response_status).to eq 201
        expect(json_response_body.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      end
    end

    patch 'web_api/v1/custom_field_option_images/:image_id' do
      with_options scope: :image do
        parameter :image, 'The base64 encoded image'
      end
      let(:image_id) { create(:custom_field_option_image).id }
      let(:image) { png_image_as_base64 'image14.jpg' }

      example_request 'Update a CustomFieldOptionImage' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      end
    end

    delete 'web_api/v1/custom_field_option_images/:image_id' do
      let(:image_id) { create(:custom_field_option_image).id }

      example_request 'Delete a CustomFieldOptionImage' do
        expect(response_status).to eq 200
        expect { CustomFieldOptionImage.find(image_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
