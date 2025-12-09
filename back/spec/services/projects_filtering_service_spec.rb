# frozen_string_literal: true

require 'rails_helper'

describe ProjectsFilteringService do
  subject(:result) { described_class.new.filter(Project.all, areas: [area.id]) }

  describe '#filter' do
    context 'when filtering by area' do
      let(:area) { create(:area) }
      let!(:project1) { create(:project, areas: [area]) }
      let!(:project2) { create(:project, include_all_areas: true) }
      let!(:project3) { create(:project) }

      it 'returns projects for the given area and `all` areas' do
        expect(result.ids).to contain_exactly(project1.id, project2.id)
      end
    end
  end
end
