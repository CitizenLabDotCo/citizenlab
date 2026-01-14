require 'rails_helper'

describe AreasFilteringService do
  let(:user) { create(:user) }

  let(:area1) { create(:area) }
  let(:area2) { create(:area) }
  let(:project_with_areas) { create(:project_with_active_ideation_phase) }
  let!(:_areas_project1) { create(:areas_project, project: project_with_areas, area: area1) }
  let!(:_areas_project2) { create(:areas_project, project: project_with_areas, area: area2) }

  describe 'for_homepage_filter' do
    it 'returns selected areas when visible projects are for specific areas (and none are for all areas)' do
      expect(ProjectsFilteringService.for_homepage_filter(user)).to include project_with_areas

      result = described_class.new.filter(Area.all, params: { for_homepage_filter: true }, current_user: user)

      expect(result).to contain_exactly(area1, area2)
    end

    it 'returns all areas when there are projects visible to user that include all areas' do
      project = create(:project, include_all_areas: true)

      expect(ProjectsFilteringService.for_homepage_filter(user)).to include project

      result = described_class.new.filter(Area.all, params: { for_homepage_filter: true }, current_user: user)

      expect(result).to eq Area.all
    end

    it 'does not return all areas when all projects for all areas are not visible to user' do
      project1 = create(:project, include_all_areas: true, visible_to: 'admins')
      project2 = create(:project, include_all_areas: true, visible_to: 'admins')

      expect(ProjectsFilteringService.for_homepage_filter(user)).not_to include project1
      expect(ProjectsFilteringService.for_homepage_filter(user)).not_to include project2

      result = described_class.new.filter(Area.all, params: { for_homepage_filter: true }, current_user: user)

      expect(result).not_to eq Area.all
    end

    it 'returns empty array when all visible projects are neither for selected nor all areas' do
      project_with_areas.destroy!
      project1 = create(:project, include_all_areas: false)

      expect(ProjectsFilteringService.for_homepage_filter(user)).to include project1

      result = described_class.new.filter(Area.all, params: { for_homepage_filter: true }, current_user: user)

      expect(result).to eq []
    end
  end
end
