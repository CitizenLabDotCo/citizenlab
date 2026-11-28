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

    example 'Lists projects for admin including the active phases span', document: false do
      do_request
      expect(status).to eq 200

      data = json_response[:data]
      active = data.find { |d| d[:id] == active_project.id }
      expect(active[:attributes][:active_phases_start_date]).not_to be_nil
      expect(active[:attributes][:active_phases_end_date]).not_to be_nil

      past = data.find { |d| d[:id] == past_project.id }
      expect(past[:attributes][:active_phases_start_date]).to be_nil
      expect(past[:attributes][:active_phases_end_date]).to be_nil
    end

    example 'Includes the total across pages', document: false do
      do_request page: { size: 1 }
      expect(status).to eq 200

      expect(json_response[:data].size).to eq 1
      expect(json_response.dig(:meta, :total)).to eq 2
    end

    example 'Shows the status as the list displays it', document: false do
      active_project.admin_publication.update!(publication_status: 'draft')
      create(:project_review, project: active_project)
      # A published project with a leftover unapproved review is still live
      create(:project_review, project: past_project)

      do_request
      statuses = json_response[:data].to_h { |d| [d[:id], d.dig(:attributes, :display_status)] }
      expect(statuses).to eq(active_project.id => 'pending', past_project.id => 'published')
    end

    example 'Says which phase each project is about right now', document: false do
      upcoming_project = create(:project)
      create(:phase, project: upcoming_project, participation_method: 'voting', voting_method: 'single_voting',
        start_at: Time.zone.today + 5.days, end_at: Time.zone.today + 10.days)
      no_phases_project = create(:project)

      do_request
      phases = json_response[:data].to_h { |d| [d[:id], d.dig(:attributes, :highlighted_phase)] }

      expect(phases[active_project.id]).to include(participation_method: 'ideation', status: 'active')
      expect(phases[past_project.id][:status]).to eq 'ended'
      expect(Time.zone.parse(phases[past_project.id][:end_at]))
        .to be_within(1.second).of(past_project.phases.maximum(:end_at))
      upcoming = phases[upcoming_project.id]
      expect(upcoming).to include(participation_method: 'voting', status: 'upcoming')
      expect(Time.zone.parse(upcoming[:start_at]).to_date).to eq(Time.zone.today + 5.days)
      expect(Time.zone.parse(upcoming[:end_at]).to_date).to eq(Time.zone.today + 10.days)
      expect(phases[no_phases_project.id]).to be_nil
    end

    example 'Lists the projects at the top level, sorted by phase', document: false do
      SettingsService.new.activate_feature!('spaces')
      create(:project, space: create(:space))

      do_request top_level: true, sort: 'phase_desc'
      expect(status).to eq 200
      expect(json_response[:data].pluck(:id)).to eq([past_project.id, active_project.id])
      expect(json_response.dig(:meta, :total)).to eq 2
    end
  end
end
