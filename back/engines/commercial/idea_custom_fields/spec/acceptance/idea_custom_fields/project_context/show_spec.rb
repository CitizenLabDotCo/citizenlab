# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/projects/:project_id/custom_fields/:id' do
    # let(:context) { create :project }
    # let(:project_id) { context.id }
    let(:custom_field) { create(:custom_field, :for_custom_form) }
    let(:id) { custom_field.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one custom field by id' do
        assert_status 200
        expect(json_parse(response_body).dig(:data, :id)).to eq id
      end

      example 'Get one disabled field', document: false do
        custom_field.update! enabled: false
        do_request
        assert_status 200
        expect(json_parse(response_body).dig(:data, :id)).to eq id
      end
    end
  end
end
