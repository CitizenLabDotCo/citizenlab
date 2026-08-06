# frozen_string_literal: true

require 'rails_helper'

describe ProjectsFilteringService do
  subject(:result) { described_class.new.filter(Project.all, areas: [area.id]) }

  describe '#filter' do
    context 'when filtering by area' do
      let_it_be(:area, reload: true) { create(:area) }
      let_it_be(:project1, reload: true) { create(:project, areas: [area]) }
      let_it_be(:project2, reload: true) { create(:project, include_all_areas: true) }
      let_it_be(:project3, reload: true) { create(:project) }

      it 'returns projects for the given area and `all` areas' do
        expect(result.ids).to contain_exactly(project1.id, project2.id)
      end
    end
  end
end
