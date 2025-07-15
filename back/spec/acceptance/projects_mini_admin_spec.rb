require 'rails_helper'
require 'rspec_api_documentation/dsl'

# Specs for the projects for admin endpoint using the ProjectMiniAdminSerializer
resource 'ProjectsMiniAdmin' do
  explanation 'Projects admin endpoint including current phase start and end dates'

  before do
    @user = create(:admin)
    header_token_for @user
  end

  let(:json_response) { json_parse(response_body) }

  get 'web_api/v1/projects/for_admin' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
    end

    let!(:active_project) { create(:project_with_active_ideation_phase) }
    let!(:past_project)   { create(:project_with_two_past_ideation_phases) }

    example 'Lists projects for admin including current_phase_start_date and current_phase_end_date', document: false do
      do_request
      expect(status).to eq 200

      data = json_response[:data]
      active = data.find { |d| d[:id] == active_project.id }
      expect(active[:attributes][:current_phase_start_date]).not_to be_nil
      expect(active[:attributes][:current_phase_end_date]).not_to be_nil

      past = data.find { |d| d[:id] == past_project.id }
      expect(past[:attributes][:current_phase_start_date]).to be_nil
      expect(past[:attributes][:current_phase_end_date]).to be_nil
    end
  end
end
