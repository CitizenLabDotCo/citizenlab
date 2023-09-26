# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'EventImage' do
  explanation 'Events can have multiple images.'

  before do
    header 'Content-Type', 'application/json'
    project = create(:continuous_project)
    @event = create(:event, project: project)
    create_list(:event_image, 2, event: @event)
  end

  let(:event_id) { @event.id }
  let(:image_id) { EventImage.first.id }

  context 'as a public user' do
    get 'web_api/v1/events/:event_id/images' do
      example_request 'List all images of an event' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end

    get 'web_api/v1/events/:event_id/images/:image_id' do
      example_request 'Get one image of an event by id' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
      end
    end
  end

  context 'as an admin' do
    before do
      header_token_for create(:admin)
    end

    post 'web_api/v1/events/:event_id/images' do
      with_options scope: :image do
        parameter :image, 'The base64 encoded image', required: true
        parameter :ordering, 'An integer that is used to order the images within an idea', required: false
      end
      ValidationErrorHelper.new.error_fields(self, IdeaImage)
      let(:image) { png_image_as_base64 'image13.png' }
      let(:ordering) { 1 }

      example_request 'Add an image to an event' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
        expect(json_response.dig(:data, :attributes, :ordering)).to eq(1)
      end
    end

    patch 'web_api/v1/events/:event_id/images/:image_id' do
      with_options scope: :image do
        parameter :image, 'The base64 encoded image'
        parameter :ordering, 'An integer that is used to order the images within an idea'
      end
      ValidationErrorHelper.new.error_fields(self, EventImage)
      let(:image) { png_image_as_base64 'image14.png' }
      let(:ordering) { 2 }

      example_request 'Update an image for an event' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :versions).keys).to match %i[small medium large fb]
        expect(json_response.dig(:data, :attributes, :ordering)).to eq(2)
      end
    end

    delete 'web_api/v1/events/:event_id/images/:image_id' do
      example_request 'Delete an image from an event' do
        expect(response_status).to eq 200
        expect { EventImage.find(image_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
