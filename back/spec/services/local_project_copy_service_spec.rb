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

    it 'copies basic project attributes' do
      copied_project = service.copy(continuous_project)
      expect(copied_project.as_json(except: %i[id title_mutliloc slug updated_at created_at]))
        .to eq continuous_project.as_json(except: %i[id title_mutliloc slug updated_at created_at])
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

    it 'ensures uniqueness of slug(s)' do
      copied_project1 = service.copy(continuous_project)
      expect(copied_project1.slug).to eq "#{continuous_project.slug}-copy"

      copied_project2 = service.copy(continuous_project.reload)
      expect(copied_project2.slug).to eq "#{continuous_project.slug}-copy-1"
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

    it 'copies associated maps configs, layers and legend items' do
      map_config = create(:map_config, project_id: continuous_project.id, tile_provider: 'https://groovy_map_tiles')
      create(:layer, map_config_id: map_config.id)
      create(:legend_item, map_config_id: map_config.id)

      copied_project = service.copy(continuous_project)
      expect(copied_project.map_config.center).to eq continuous_project.map_config.center
      expect(copied_project.map_config.layers.first.as_json(except: %i[id map_config_id updated_at created_at]))
        .to eq continuous_project.map_config.layers.first.as_json(except: %i[id map_config_id updated_at created_at])
      expect(copied_project.map_config.layers.first.map_config_id).to eq copied_project.map_config.id
      expect(copied_project.map_config.legend_items.first.as_json(except: %i[id map_config_id updated_at created_at]))
        .to eq continuous_project.map_config.legend_items.first.as_json(except: %i[id map_config_id updated_at created_at])
      expect(copied_project.map_config.legend_items.first.map_config_id).to eq copied_project.map_config.id
    end

    it 'copies associated volunteering_causes' do
      cause = create(:cause, title_multiloc: { en: 'Test cause' })
      source_project = Project.find(cause.participation_context_id)

      copied_project = service.copy(source_project)
      expect(copied_project.causes.first.participation_context_id).to eq copied_project.id
      expect(copied_project.causes.first.as_json(except: %i[id participation_context_id image updated_at created_at]))
        .to eq source_project.causes.first.as_json(except: %i[id participation_context_id image updated_at created_at])
    end

    it 'copies associated custom_forms & related custom_fields & custom_field_options' do
      custom_form = create(:custom_form)
      custom_field = create(:custom_field, resource_type: 'CustomForm', input_type: 'select', resource_id: custom_form.id)
      create(:custom_field_option, custom_field_id: custom_field.id)
      source_project = Project.find(custom_form.participation_context_id)
      copied_project = service.copy(source_project)

      expect(copied_project.custom_form.participation_context_type).to eq source_project.custom_form.participation_context_type
      expect(copied_project.custom_form.custom_fields.first.as_json(except: %i[id resource_id ordering updated_at created_at]))
        .to eq source_project.custom_form.custom_fields.first.as_json(except: %i[id resource_id ordering updated_at created_at])
      expect(copied_project.custom_form.custom_fields.first.options.first.as_json(except: %i[id custom_field_id updated_at created_at]))
        .to eq source_project.custom_form.custom_fields.first.options.first.as_json(except: %i[id custom_field_id updated_at created_at])
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
      expect(copied_project.phases.first.as_json(except: %i[id project_id start_at end_at updated_at created_at]))
        .to eq timeline_project.phases.first.as_json(except: %i[id project_id start_at end_at updated_at created_at])
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
      travel_to Time.now do
        phase1_start = timeline_project.phases.order(:start_at).first.start_at
        phase2_end = timeline_project.phases.order(:start_at).second.end_at

        today = Time.zone.today
        expected_shift = (today - phase1_start).days
        copied_project = service.copy(timeline_project)

        expect(copied_project.phases.order(:start_at).first.start_at).to eq today
        expect(copied_project.phases.order(:start_at).second.end_at).to eq phase2_end + expected_shift
      end
    end
  end
end
