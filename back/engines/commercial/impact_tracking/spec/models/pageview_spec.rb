# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImpactTracking::Pageview do
  subject { build(:pageview) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'Relations' do
    it 'nullifies project_id if project is deleted' do
      project = create(:project)
      pageview = create(:pageview, project_id: project.id)

      expect(pageview.project_id).to eq(project.id)

      project.destroy

      expect(pageview.reload.project_id).to be_nil
    end
  end
end
