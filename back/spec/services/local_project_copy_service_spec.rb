# frozen_string_literal: true

require 'rails_helper'

describe LocalProjectCopyService do
  let(:service) { described_class.new }

  describe 'project copy', slow_test: true do
    let!(:continuous_project) do
      create(
        :continuous_project,
        admin_publication_attributes: { publication_status: 'published' },
        title_multiloc: { en: 'Copy me' },
        slug: 'copy-me',
        participation_method: 'ideation',
        posting_enabled: true,
        posting_method: 'unlimited',
        posting_limited_max: 1,
        commenting_enabled: true,
        voting_enabled: true,
        upvoting_method: 'unlimited',
        upvoting_limited_max: 10,
        downvoting_enabled: true,
        downvoting_method: 'limited',
        downvoting_limited_max: 3,
        presentation_mode: 'card',
        min_budget: 1000,
        max_budget: 5000,
        ideas_order: 'trending',
        input_term: 'idea',
        description_preview_multiloc: { en: 'Description preview text' },
        comments_count: 0,
        ideas_count: 0,
        include_all_areas: false,
        internal_role: nil,
        process_type: 'continuous',
        visible_to: 'public',
        folder_id: nil
      )
    end

    let!(:timeline_project) { create :project_with_past_ideation_and_current_information_phase }
    let!(:folder) { create :project_folder }

    it 'works' do
      project_count = Project.count
      service.copy(continuous_project)

      expect(Project.count).to eq project_count + 1
    end

    it 'creates a copied project with an associated publication status of draft' do
      copied_project = service.copy(continuous_project)

      expect(copied_project.admin_publication.publication_status).to eq 'draft'
    end

    it 'adds a suffix to the title_multiloc' do
      continuous_project.title_multiloc['en'] = 'Test title'
      continuous_project.save!
      copied_project = service.copy(continuous_project)

      expect(copied_project.title_multiloc['en']).to eq 'Test title - Copy'
    end

    it 'copies basic project attributes' do
      copied_project = service.copy(continuous_project)

      expect(copied_project.slug).to eq "#{continuous_project.slug}-copy"
      expect(copied_project.participation_method).to eq continuous_project.participation_method
      expect(copied_project.posting_enabled).to eq continuous_project.posting_enabled
      expect(copied_project.posting_method).to eq continuous_project.posting_method
      expect(copied_project.posting_limited_max).to eq continuous_project.posting_limited_max
      expect(copied_project.commenting_enabled).to eq continuous_project.commenting_enabled
      expect(copied_project.voting_enabled).to eq continuous_project.voting_enabled
      expect(copied_project.upvoting_method).to eq continuous_project.upvoting_method
      expect(copied_project.upvoting_limited_max).to eq continuous_project.upvoting_limited_max
      expect(copied_project.downvoting_enabled).to eq continuous_project.downvoting_enabled
      expect(copied_project.downvoting_method).to eq continuous_project.downvoting_method
      expect(copied_project.downvoting_limited_max).to eq continuous_project.downvoting_limited_max
      expect(copied_project.presentation_mode).to eq continuous_project.presentation_mode
      expect(copied_project.min_budget).to eq continuous_project.min_budget
      expect(copied_project.max_budget).to eq continuous_project.max_budget
      expect(copied_project.ideas_order).to eq continuous_project.ideas_order
      expect(copied_project.input_term).to eq continuous_project.input_term
      expect(copied_project.description_preview_multiloc).to eq continuous_project.description_preview_multiloc
      expect(copied_project.comments_count).to eq continuous_project.comments_count
      expect(copied_project.ideas_count).to eq continuous_project.ideas_count
      expect(copied_project.include_all_areas).to eq continuous_project.include_all_areas
      expect(copied_project.internal_role).to eq continuous_project.internal_role
      expect(copied_project.process_type).to eq continuous_project.process_type
      expect(copied_project.visible_to).to eq continuous_project.visible_to
      expect(copied_project.folder_id).to eq continuous_project.folder_id
    end

    it 'copies project to same folder as source project' do
      source_project = build(:project, folder_id: folder.id)

      copied_project = service.copy(source_project)
      expect(copied_project.folder_id).to eq source_project.folder_id
    end

    it 'associates areas of source project with copied project' do
      source_project = build(:project, areas: create_list(:area, 2))

      copied_project = service.copy(source_project)
      expect(copied_project.areas).to eq source_project.areas
    end

    it 'associates topics of source project with copied project' do
      source_project = build(:project, topics: create_list(:topic, 2))

      copied_project = service.copy(source_project)
      expect(copied_project.topics).to eq source_project.topics
    end

    it 'copies associated projects_allowed_input_topics' do
      topics = create_list(:topic, 3)
      source_project = create(:project)
      create(:projects_allowed_input_topic, project_id: source_project.id, topic_id: topics.first.id)
      create(:projects_allowed_input_topic, project_id: source_project.id, topic_id: topics.second.id)

      copied_project = service.copy(source_project)
      expect(copied_project.allowed_input_topics).to eq [topics.first, topics.second]
    end

    it "associates correct groups with copied project's groups visibility permission" do
      source_project = create(:private_groups_project)

      copied_project = service.copy(source_project)
      expect(copied_project.groups).to eq source_project.groups
    end

    it 'associates correct groups with actions group permissions of copied continuous ideation project' do
      source_project = create(:project, participation_method: 'ideation')

      permission = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Project',
        permission_scope_id: source_project.id,
        permitted_by: 'groups',
        groups: create_list(:group, 2)
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission.save!(validate: false)

      copied_project = service.copy(source_project)
      expect(copied_project.permissions.first.groups).to eq source_project.permissions.first.groups
    end

    it 'copies basic phase attributes' do
      copied_project = service.copy(timeline_project)

      expect(copied_project.phases.first.project_id).to eq copied_project.id
      expect(copied_project.phases.first.title_multiloc).to eq timeline_project.phases.first.title_multiloc
      expect(copied_project.phases.first.description_multiloc).to eq timeline_project.phases.first.description_multiloc
      expect(copied_project.phases.first.participation_method).to eq timeline_project.phases.first.participation_method
      expect(copied_project.phases.first.posting_enabled).to eq timeline_project.phases.first.posting_enabled
      expect(copied_project.phases.first.commenting_enabled).to eq timeline_project.phases.first.commenting_enabled
      expect(copied_project.phases.first.voting_enabled).to eq timeline_project.phases.first.voting_enabled
      expect(copied_project.phases.first.upvoting_method).to eq timeline_project.phases.first.upvoting_method
      expect(copied_project.phases.first.upvoting_limited_max).to eq timeline_project.phases.first.upvoting_limited_max
      expect(copied_project.phases.first.presentation_mode).to eq timeline_project.phases.first.presentation_mode
      expect(copied_project.phases.first.max_budget).to eq timeline_project.phases.first.max_budget
      expect(copied_project.phases.first.poll_anonymous).to eq timeline_project.phases.first.poll_anonymous
      expect(copied_project.phases.first.downvoting_enabled).to eq timeline_project.phases.first.downvoting_enabled
      expect(copied_project.phases.first.ideas_count).to eq timeline_project.phases.first.ideas_count
      expect(copied_project.phases.first.ideas_order).to eq timeline_project.phases.first.ideas_order
      expect(copied_project.phases.first.input_term).to eq timeline_project.phases.first.input_term
      expect(copied_project.phases.first.min_budget).to eq timeline_project.phases.first.min_budget
      expect(copied_project.phases.first.downvoting_method).to eq timeline_project.phases.first.downvoting_method
      expect(copied_project.phases.first.downvoting_limited_max).to eq timeline_project.phases.first.downvoting_limited_max
      expect(copied_project.phases.first.posting_method).to eq timeline_project.phases.first.posting_method
      expect(copied_project.phases.first.posting_limited_max).to eq timeline_project.phases.first.posting_limited_max
    end

    it 'associates correct groups with actions group permissions of copied ideation phase' do
      source_project = create(:project_with_active_ideation_phase)

      permission = build(
        :permission,
        action: 'posting_idea',
        permission_scope_type: 'Phase',
        permission_scope_id: source_project.phases.first.id,
        permitted_by: 'groups',
        groups: create_list(:group, 2)
      )
      # Skip validation to avoid Validation failed: Action has already been taken
      permission.save!(validate: false)

      # This prevents flakiness, whereby source project phase would have no groups
      # associated with the permission evaluated in the expectation, in approx 1 out of 3 test runs.
      source_project.phases.first.permissions = [permission]

      copied_project = service.copy(source_project)
      expect(copied_project.phases.first.permissions.first.groups).to eq source_project.phases.first.permissions.first.groups
    end

    it 'shifts timelines of phases to start first phase on day of copying' do
      phase1_start = timeline_project.phases.order(:start_at).first.start_at
      phase2_end = timeline_project.phases.order(:start_at).second.end_at

      travel_to Time.now do
        today = Time.zone.today
        expected_shift = (today - phase1_start).days
        copied_project = service.copy(timeline_project)

        expect(copied_project.phases.order(:start_at).first.start_at).to eq today
        expect(copied_project.phases.order(:start_at).second.end_at).to eq phase2_end + expected_shift
      end
    end
  end
end
