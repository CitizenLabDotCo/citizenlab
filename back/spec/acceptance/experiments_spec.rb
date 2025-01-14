# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/publication_filtering_model'

resource 'Experiments' do
  explanation 'AB test data'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/experiments' do
    before do
      @experiments = create_list(:experiment, 5)
    end

    context 'When admin' do
      before { admin_header_token }

      example_request 'List all experiments' do
        assert_status(200)
        expect(response_data.size).to eq 5
      end
    end
  end

  post 'web_api/v1/experiments' do
    with_options scope: :experiment do
      parameter :name, 'The name of the experiment, as a string', required: true
      parameter :treatment, 'The "treatment", or the option that was randomly assigned to the user', required: true
      parameter :action, 'The action, or how the user responded to the treatment', required: true
    end

    let(:name) { 'Button location' }
    let(:treatment) { 'Left' }
    let(:action) { 'Button clicked' }

    example_request 'Create an experiment' do
      expect(response_status).to eq 201
      expect(response_data.dig(:attributes, :name)).to match 'Button location'
    end
  end
end
