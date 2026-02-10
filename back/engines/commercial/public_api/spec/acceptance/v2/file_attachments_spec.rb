# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'File Attachments' do
  explanation <<~DESC.squish
    File attachments represent files that are linked to specific resources (like ideas, initiatives, etc.) within the platform.
  DESC

  include_context 'common_auth'

  let!(:user) { create(:user) }
  let!(:project) { create(:project) }
  let!(:idea) { create(:idea, project: project) }

  let!(:files) do
    create_list(:file, 2, uploader: user, projects: [project])
  end

  let!(:file_attachments) do
    files.map do |file|
      create(:file_attachment, file: file, attachable: idea)
    end
  end

  get '/api/v2/file_attachments/' do
    route_summary 'List file attachments'
    route_description 'Retrieve a paginated list of all file attachments in the platform.'

    include_context 'common_list_params'

    parameter :attachable_id, 'Filter by attachable ID (can be an array)', type: %i[string array]
    parameter :attachable_type, 'Filter by attachable type (can be an array)', type: %i[string array]

    context 'when the page size is smaller than the total number of attachments' do
      let(:page_size) { 1 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:'files/file_attachments'].size).to eq(page_size)
      end
    end

    context 'when filtering by attachable_id' do
      let(:attachable_id) { idea.id }

      example_request 'Returns file attachments for the specified attachable' do
        assert_status 200
        expect(json_response_body[:'files/file_attachments'].map { |fa| fa[:attachable_id] })
          .to all(eq(idea.id))
      end
    end

    context 'when filtering by attachable_type' do
      let(:attachable_type) { 'Idea' }

      example_request 'Returns file attachments for the specified type' do
        assert_status 200
        expect(json_response_body[:'files/file_attachments'].map { |fa| fa[:attachable_type] })
          .to all(eq('Idea'))
      end
    end

    context 'when filtering by both attachable_id and type' do
      let(:attachable_id) { idea.id }
      let(:attachable_type) { 'Idea' }

      example_request 'Returns file attachments matching both filters' do
        assert_status 200
        attachments = json_response_body[:'files/file_attachments']
        expect(attachments).to all(include(
          attachable_id: idea.id,
          attachable_type: 'Idea'
        ))
      end
    end
  end

  get '/api/v2/file_attachments/:id' do
    route_summary 'Get file attachment'
    route_description 'Retrieve a single file attachment by its ID.'

    include_context 'common_item_params'

    let(:file_attachment) { file_attachments[0] }
    let(:id) { file_attachment.id }

    example_request 'Returns the file attachment' do
      assert_status 200
      expect(json_response_body[:'files/file_attachment']).to include(
        id: id,
        attachable_id: idea.id,
        attachable_type: 'Idea'
      )
    end
  end
end
