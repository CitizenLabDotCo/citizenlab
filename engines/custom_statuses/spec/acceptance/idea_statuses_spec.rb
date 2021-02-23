# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# rubocop:disable Metrics/BlockLength
resource 'IdeaStatuses' do
  explanation 'Idea statuses reflect the cities attitude towards an idea. Each tenant has its own custom set of idea statuses.'

  before do
    header 'Content-Type', 'application/json'
    @statuses = create_list(:idea_status, 3)
  end

  context 'when not logged in' do
    post 'web_api/v1/idea_statuses' do
      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:idea_status) { build(:idea_status) }
      let(:code) { 'proposed' }
      let(:title_multiloc) { idea_status.title_multiloc }
      let(:description_multiloc) { idea_status.description_multiloc }
      let(:color) { idea_status.color }
      let(:ordering) { 2 }

      example_request 'Cannot create an idea status' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:new_idea_status) { build(:idea_status) }
      let(:code) { 'custom' }
      let(:title_multiloc) { new_idea_status.title_multiloc }
      let(:description_multiloc) { new_idea_status.description_multiloc }
      let(:color) { new_idea_status.color }
      let(:ordering) { 1 }

      example_request 'Cannot update an idea status by id' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      example_request 'Cannot delete a idea status by id' do
        expect(status).to eq 401
      end
    end
  end

  context 'when signed in as a non-admin user' do
    before do
      user_header_token
    end

    post 'web_api/v1/idea_statuses' do
      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:idea_status) { build(:idea_status) }
      let(:code) { 'proposed' }
      let(:title_multiloc) { idea_status.title_multiloc }
      let(:description_multiloc) { idea_status.description_multiloc }
      let(:color) { idea_status.color }
      let(:ordering) { 2 }

      example_request 'Cannot create an idea status' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:new_idea_status) { build(:idea_status) }
      let(:code) { 'custom' }
      let(:title_multiloc) { new_idea_status.title_multiloc }
      let(:description_multiloc) { new_idea_status.description_multiloc }
      let(:color) { new_idea_status.color }
      let(:ordering) { 1 }

      example_request 'Cannot update an idea status by id' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      example_request 'Cannot delete a idea status by id' do
        expect(status).to eq 401
      end
    end
  end

  context 'when signed in as an admin' do
    before do
      admin_header_token
    end

    post 'web_api/v1/idea_statuses' do
      let(:id) { @statuses.first.id }

      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:idea_status) { build(:idea_status) }
      let(:code) { 'proposed' }
      let(:title_multiloc) { idea_status.title_multiloc }
      let(:description_multiloc) { idea_status.description_multiloc }
      let(:color) { idea_status.color }
      let(:ordering) { 2 }

      example_request 'Create an idea status' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to_not be_empty
      end
    end

    patch 'web_api/v1/idea_statuses/:id' do
      let(:idea_status) { create(:idea_status, code: 'proposed') }
      let(:id) { @statuses.first.id }

      with_options scope: :idea_status do
        parameter :title_multiloc, 'Multi-locale field with the idea title', required: true
        parameter :description_multiloc, 'Multi-locale field with the idea status description'
        parameter :color, 'The hexadecimal color code of this status\'s label.'
        parameter :code, 'A snake_case value to help us identify the lifecycle status of the idea'
        parameter :ordering, 'The order value of the idea status.'
      end

      let(:new_idea_status) { build(:idea_status) }
      let(:code) { 'custom' }
      let(:title_multiloc) { new_idea_status.title_multiloc }
      let(:description_multiloc) { new_idea_status.description_multiloc }
      let(:color) { new_idea_status.color }
      let(:ordering) { 1 }

      example_request 'Update an idea status by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @statuses.first.id
      end
    end

    delete 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      parameter :ideas_fallback_status, 'The new status of Ideas assigned to the status with :id'

      example_request 'Delete a idea status by id' do
        expect(status).to eq 204
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength
