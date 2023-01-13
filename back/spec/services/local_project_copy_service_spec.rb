# frozen_string_literal: true

require 'rails_helper'

describe LocalProjectCopyService do
  let(:service) { described_class.new }

  describe 'project copy', slow_test: true do
    let!(:project) { create :project }
    let!(:timeline_project) { create :project_with_past_ideation_and_current_information_phase }

    it 'works' do
      project_count = Project.count
      service.copy(project)

      expect(Project.count).to eq project_count + 1
    end

    it 'adds a suffix to the title_multiloc' do
      project.title_multiloc['en'] = 'Test title'
      project.save!
      copied_project = service.copy(project)

      expect(copied_project.title_multiloc['en']).to eq 'Test title - Copy'
    end

    it 'shifts timelines of phases to start first phase on day of copying' do
      phase1_start = timeline_project.phases.order(:start_at).first.start_at
      phase2_end = timeline_project.phases.order(:start_at).second.end_at
      today = Time.zone.today # Use saved value, just in case test runs as midnight passes
      expected_shift = (today - phase1_start).days
      copied_project = service.copy(timeline_project)

      expect(copied_project.phases.order(:start_at).first.start_at).to eq today
      expect(copied_project.phases.order(:start_at).second.end_at).to eq phase2_end + expected_shift
    end

    it 'creates a copied project with an associated publication status of draft' do
      copied_project = service.copy(project)

      expect(copied_project.admin_publication.publication_status).to eq 'draft'
    end
  end
end
