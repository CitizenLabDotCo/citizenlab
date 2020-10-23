# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# rubocop:disable Metrics/BlockLength
resource 'Reordering Phase Ideas' do
  before do
    header 'Content-Type', 'application/json'
  end

  context 'As an admin updating an ideation phase' do
    before do
      admin_header_token
      create(:phase, :with_ideas)
    end

    patch 'web_api/v1/phases/:phase_id/ideas_order' do
      route_summary 'Allows updating the default sorting of the associated ideas of an ideation phase.'
      route_description 'Allowed ideas_order values are: new, -new, trending, popular and random.'

      ## Setting the required default value for rspec_api_documentation, but otherwise useless
      let(:ideas_order) { 'new' }

      ## The useful stuff
      let(:phase_id) { Phase.first.id }
      let(:phase) { Phase.find(phase_id) }
      let(:response_idea_ids) { ideas_ids_for_response(json_parse(response_body)) }

      with_options scope: :phase, with_example: true do
        parameter :ideas_order, 'The default order of ideas.'
      end

      example_request 'Update an ideation phase\'s order of Ideas to new' do
        ideas_order = 'new'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 200
        expect(response_idea_ids).to eq ordered_ideas_ids_for(phase, ideas_order)
      end

      example_request 'Update an ideation phase\'s order of Ideas to -new' do
        ideas_order = '-new'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 200
        expect(response_idea_ids).to eq ordered_ideas_ids_for(phase, ideas_order)
      end

      example_request 'Update an ideation phase\'s order of Ideas to trending' do
        pending 'Needs a fix in TrendingIdeaService'
        ideas_order = 'trending'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 200
        expect(response_idea_ids).to eq ordered_ideas_ids_for(phase, ideas_order)
      end

      example_request 'Update an ideation phase\'s order of Ideas to popular' do
        ideas_order = 'popular'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 200
        expect(response_idea_ids).to eq ordered_ideas_ids_for(phase, ideas_order)
      end

      example_request 'Update an ideation phase\'s order of Ideas to random' do
        ideas_order = 'random'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 200
        expect(response_idea_ids).to eq ordered_ideas_ids_for(phase, ideas_order)
      end

      example_request 'Fails to update an ideation phase\'s order of Ideas to a value not present in the list' do
        ideas_order = 'other'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 422
      end
    end
  end

  context 'As a regular user updating an ideation phase' do
    before do
      user_header_token
      create(:phase, :with_ideas)
    end

    patch 'web_api/v1/phases/:phase_id/ideas_order' do
      route_summary 'Changing Ideas Ordering cannot be performed by regular users.'
      ## Setting the required default value for rspec_api_documentation, but otherwise useless
      let(:ideas_order) { 'new' }

      ## The useful stuff
      let(:phase_id) { Phase.first.id }
      let(:phase) { Phase.find(phase_id) }
      let(:response_idea_ids) { ideas_ids_for_response(json_parse(response_body)) }

      with_options scope: :phase, with_example: true do
        parameter :ideas_order, 'The default order of ideas.'
      end

      example_request 'Returns an unauthorized status' do
        ideas_order = 'random'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 401
      end
    end
  end

  context 'As an admin updating a non-ideation phase' do
    before do
      admin_header_token
      create(:volunteering_phase)
    end

    patch 'web_api/v1/phases/:phase_id/ideas_order' do
      route_summary 'Changing Ideas Ordering cannot be performed in non-ideation phases.'
      ## Setting the required default value for rspec_api_documentation, but otherwise useless
      let(:ideas_order) { 'new' }

      ## The useful stuff
      let(:phase_id) { Phase.first.id }
      let(:phase) { Phase.find(phase_id) }
      let(:response_idea_ids) { ideas_ids_for_response(json_parse(response_body)) }

      with_options scope: :phase, with_example: true do
        parameter :ideas_order, 'The default order of ideas.'
      end

      example_request 'Returns an unauthorized status' do
        ideas_order = 'random'

        do_request(phase_params_with(ideas_order))
        expect(response_status).to eq 422
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength

def ordered_ideas_ids_for(phase, order)
  Idea.joins(:ideas_phases)
      .merge(IdeasPhase.where(phase: phase))
      .order_with(order).pluck(:id)
end

def ideas_ids_for_response(response_body)
  response_body.dig(:data, :relationships, :ideas, :data).map { |obj| obj[:id] }
end

def phase_params_with(ideas_order)
  {
    phase: {
      ideas_order: ideas_order
    }
  }
end
