# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'IdeaStatuses' do
  explanation 'Input statuses reflect the cities attitude towards an input. There are two global sets of input statuses that can be customized: one for ideation and one for proposals.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/idea_statuses' do
    before { create_list(:idea_status, 3) } # TODO: ideation + proposals + before_all?

    context 'when visitor' do
      example_request 'List all idea statuses' do # TODO: participation_method filter (ideation)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end

    context 'when resident' do
      before { resident_header_token }

      example_request 'List all idea statuses' do # TODO: participation_method filter (proposals)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all idea statuses' do # TODO: no participation_method filter (all?)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end
  end

  get 'web_api/v1/idea_statuses/:id' do
    let(:id) { create(:idea_status).id }

    context 'when visitor' do
      example_request 'Get one idea status by id' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end
  end

  post 'web_api/v1/idea_statuses' do # TODO: ideation + proposals
    with_options scope: :idea_status do # TODO: which are required?
      parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
      parameter :description_multiloc, 'Multi-locale field with the idea status description'
      parameter :color, 'The hexadecimal color code of this status\'s label.'
      parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
      # TODO: participation_method
    end

    let(:idea_status) { build(:idea_status) }
    let(:code) { 'rejected' } # TODO: Change, remove or custom?
    let(:title_multiloc) { { 'en' => 'Inappropriate' } }
    let(:description_multiloc) { { 'en' => 'Custom description' } }
    let(:color) { '#767676' }

    context 'when visitor' do
      example 'Cannot create an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Create an idea status' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).not_to be_empty
        # TODO: Check attributes
      end

      example_request 'Create a proposal status status' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).not_to be_empty
        # TODO: Check attributes
      end
    end
  end

  patch 'web_api/v1/idea_statuses/:id' do
    let(:id) { create(:idea_status).id }

    with_options scope: :idea_status do
      parameter :title_multiloc, 'Multi-locale field with the idea title'
      parameter :description_multiloc, 'Multi-locale field with the idea status description'
      parameter :color, 'The hexadecimal color code of this status\'s label.'
      parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
    end

    # let(:new_idea_status) { build(:idea_status) }
    # let(:code) { 'custom' }
    let(:title_multiloc) { { 'en' => 'Changed title' } }
    # let(:description_multiloc) { new_idea_status.description_multiloc }
    # let(:color) { new_idea_status.color }

    context 'when resident' do
      before { resident_header_token }

      example 'Cannot update an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Update an idea status by id' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
        # TODO: Check attributes
      end
    end
  end

  delete 'web_api/v1/idea_statuses/:id' do
    let(:id) { create(:idea_status).id }

    context 'when visitor' do
      example 'Cannot delete an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when resident' do
      before { resident_header_token }

      example 'Cannot delete an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Delete a idea status by id' do
        assert_status 204
        # TODO: Check that it's gone
      end
    end
  end
end
