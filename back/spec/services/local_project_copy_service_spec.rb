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

    it "associates correct groups with copied project's groups visibility permission" do
      source_project = create(:private_groups_project)

      copied_project = service.copy(source_project)
      expect(copied_project.groups).to eq source_project.groups
    end

    it 'associates correct groups with actions group permissions of copied continuous ideation project' do
      groups = create_list(:group, 3)
      source_project = create(:project, participation_method: 'ideation')

      permission = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Project',
        permission_scope_id: source_project.id,
        permitted_by: 'groups',
        groups: groups
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission.save!(validate: false)

      copied_project = service.copy(source_project)
      expect(copied_project.permissions.first.groups).to eq source_project.permissions.first.groups
    end

    it 'associates correct groups with actions group permissions of copied ideation phase' do
      groups = create_list(:group, 3)
      source_project = create(:project_with_active_ideation_phase)

      permission = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Phase',
        permission_scope_id: source_project.phases.first.id,
        permitted_by: 'groups',
        groups: groups
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission.save!(validate: false)

      # This prevents flakiness, whereby source project phase would have no groups
      # associated with the permission evaluated in the expectation, in approx 1 out of 3 test runs.
      source_project.phases.first.permissions = [permission]

      copied_project = service.copy(source_project)
      expect(copied_project.phases.first.permissions.first.groups).to eq source_project.phases.first.permissions.first.groups
    end

    it 'associates areas of source project with copied project' do
      area1 = create(:area)
      area2 = create(:area)
      source_project = build(:project, areas: [area1, area2])

      copied_project = service.copy(source_project)
      expect(copied_project.areas).to eq source_project.areas
    end

    it 'associates topics of source project with copied project' do
      topic1 = create(:topic)
      topic2 = create(:topic)
      source_project = build(:project, topics: [topic1, topic2])

      copied_project = service.copy(source_project)
      expect(copied_project.topics).to eq source_project.topics
    end
  end
end
