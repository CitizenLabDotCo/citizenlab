# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::MostReactedIdeas do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    let_it_be(:phase) { create(:phase) }
    let_it_be(:project) { phase.project }
    let_it_be(:ideas) do
      create_list(:idea, 2, phases: [phase], project_id: project.id).tap do |ideas|
        create(:idea_image, idea: ideas.first)
      end
    end

    context 'when phase_id is provided' do
      it 'returns serialized data' do
        result = query.run_query(phase_id: phase.id, number_of_ideas: 2)

        expect(result[:ideas].size).to eq(2)
        expect(result[:project][:id]).to eq(project.id)
        expect(result[:phase][:id]).to eq(phase.id)

        expect(result[:idea_images]).to include({
          ideas.first.id => [hash_including(attributes: instance_of(Hash))],
          ideas.second.id => []
        })
        expect(result[:idea_images].keys.length).to eq(2)
      end
    end

    context 'when phase_id is not provided' do
      it 'returns an empty hash' do
        expect(query.run_query).to eq({})
      end
    end
  end
end
