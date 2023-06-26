# frozen_string_literal: true

require 'rails_helper'

describe LocalProjectCopyService do
  let(:service) { described_class.new }

  describe 'project copy' do
    # Some factories use en & nl-NL multilocs, others use en & nl-BE, but the apply_template method, invoked by the
    # LocalProjectCopyService, will only apply multiloc k-v pairs with keys that match the target tenant locale(s).
    # Thus, we specify all 3 locales to enable easier testing with factory generated multilocs.
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['locales'] = %w[en nl-BE nl-NL]
      config.save!
    end

    let(:with_permissions) { false }
    let!(:continuous_project) do
      create(
        :continuous_project,
        with_permissions: with_permissions,
        admin_publication_attributes: { publication_status: 'published' },
        title_multiloc: { en: 'Copy me' },
        slug: 'copy-me',
        participation_method: 'ideation',
        posting_enabled: true,
        posting_method: 'unlimited',
        posting_limited_max: 1,
        commenting_enabled: true,
        reacting_enabled: true,
        reacting_like_method: 'unlimited',
        reacting_like_limited_max: 10,
        reacting_dislike_enabled: true,
        reacting_dislike_method: 'limited',
        reacting_dislike_limited_max: 3,
        presentation_mode: 'card',
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

    let!(:timeline_project) { create(:project_with_past_ideation_and_current_information_phase) }
    let!(:folder) { create(:project_folder) }

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

      expect(copied_project.areas.map(&:as_json)).to match_array(source_project.areas.map(&:as_json))
    end

    it 'associates topics of source project with copied project' do
      source_project = create(:project, topics: create_list(:topic, 2))
      copied_project = service.copy(source_project.reload)

      expect(copied_project.topics.map(&:as_json)).to match_array(source_project.topics.map(&:as_json))
    end

    it 'copies associated projects_allowed_input_topics' do
      create_list(:projects_allowed_input_topic, 2, project_id: continuous_project.id)
      copied_project = service.copy(continuous_project)

      expect(copied_project.allowed_input_topics.count).to eq 2
      expect(copied_project.allowed_input_topics.map(&:as_json))
        .to match_array(continuous_project.allowed_input_topics.map(&:as_json))
    end

    it 'copies associated maps configs, layers and legend items' do
      map_config = create(:map_config, project_id: continuous_project.id, tile_provider: 'https://groovy_map_tiles')
      create_list(:layer, 2, map_config_id: map_config.id)
      create_list(:legend_item, 2, map_config_id: map_config.id)
      copied_project = service.copy(continuous_project)

      expect(copied_project.map_config.center).to eq continuous_project.map_config.center

      expect(copied_project.map_config.layers.map do |record|
        record.as_json(except: %i[id map_config_id updated_at created_at])
      end)
        .to match_array(continuous_project.map_config.layers.map do |record|
          record.as_json(except: %i[id map_config_id updated_at created_at])
        end)

      expect(copied_project.map_config.legend_items.map do |record|
        record.as_json(only: %i[title_multiloc color ordering])
      end)
        .to match_array(continuous_project.map_config.legend_items.map do |record|
          record.as_json(only: %i[title_multiloc color ordering])
        end)
    end

    it 'copies associated volunteering_causes' do
      create_list(:cause, 2, participation_context_id: continuous_project.id, participation_context_type: 'Project')
      copied_project = service.copy(continuous_project.reload)

      expect(copied_project.causes.map do |record|
        record.as_json(except: %i[id participation_context_id image updated_at created_at])
      end)
        .to match_array(continuous_project.causes.map do |record|
          record.as_json(except: %i[id participation_context_id image updated_at created_at])
        end)
    end

    it 'copies associated custom_forms & related custom_fields & custom_field_options' do
      custom_form = create(
        :custom_form,
        participation_context_id: continuous_project.id,
        participation_context_type: 'Project'
      )
      create_list(:custom_field_select, 5, :with_options, resource_type: 'CustomForm', resource_id: custom_form.id)
      copied_project = service.copy(continuous_project.reload)

      expect(copied_project.custom_form.custom_fields.map do |record|
        record.as_json(except: %i[id resource_id updated_at created_at])
      end)
        .to match_array(continuous_project.custom_form.custom_fields.map do |record|
          record.as_json(except: %i[id resource_id updated_at created_at])
        end)

      source_custom_field = continuous_project.custom_form.custom_fields.last
      copied_custom_field = copied_project.custom_form.custom_fields
        .find_by(key: source_custom_field.key)

      expect(copied_custom_field.options.map do |record|
        record.as_json(except: %i[id custom_field_id updated_at created_at])
      end)
        .to match_array(copied_custom_field.options.map do |record|
          record.as_json(except: %i[id custom_field_id updated_at created_at])
        end)
    end

    it 'copies associated poll questions & options' do
      source_project = create(:continuous_poll_project)
      create_list(
        :poll_question,
        2,
        :with_options,
        participation_context_id: source_project.id,
        participation_context_type: 'Project'
      )

      copied_project = service.copy(source_project)

      expect(copied_project.poll_questions.count).to eq 2
      expect(copied_project.poll_questions.map do |record|
        record.as_json(except: %i[id participation_context_id updated_at created_at])
      end)
        .to match_array(source_project.poll_questions.map do |record|
          record.as_json(except: %i[id participation_context_id updated_at created_at])
        end)

      source_question = source_project.poll_questions.last
      copied_question = copied_project.poll_questions.find_by(title_multiloc: source_question.title_multiloc)

      expect(copied_question.options.map { |record| record.as_json(except: %i[id question_id updated_at created_at]) })
        .to match_array(source_question.options.map do |record|
          record.as_json(except: %i[id question_id updated_at created_at])
        end)
    end

    it "associates correct groups with copied project's groups visibility permission" do
      source_project = create(:private_groups_project)

      copied_project = service.copy(source_project)
      expect(copied_project.groups).to match_array(source_project.groups)
    end

    describe 'when a certain project action is permitted only for groups' do
      let(:with_permissions) { true }
      let(:groups) { create_list(:group, 2) }
      let(:permission) do
        ParticipationContextService.new
          .get_participation_context(continuous_project).permissions
          .find_by(action: 'commenting_idea')
      end

      it 'copies the action groups permission' do
        permission.update!(permitted_by: 'groups', groups: groups)

        copied_project = service.copy(continuous_project)
        expect(copied_project.permissions.find_by(action: 'commenting_idea').groups).to match_array(groups)
      end
    end

    describe 'when source project has file attachments' do
      before { create_list(:project_file, 2, project: continuous_project) }

      it 'creates associated copies of the file attachments' do
        copied_project = service.copy(continuous_project)

        expect(copied_project.project_files.count).to eq 2
        expect(copied_project.project_files.first.file.url).to include(continuous_project.project_files.first.name)

        expect(copied_project.project_files.map do |record|
          record.as_json(only: %i[ordering name])
        end)
          .to match_array(continuous_project.project_files.map do |record|
            record.as_json(only: %i[ordering name])
          end)
      end
    end

    it 'copies basic phase attributes' do
      ignore_attributes = %i[
        id project_id start_at end_at updated_at created_at
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea
        voting_term_singular_multiloc voting_term_plural_multiloc
        survey_embed_url survey_service
      ]
      copied_project = service.copy(timeline_project)

      expect(copied_project.phases.map do |record|
        record.as_json(except: ignore_attributes)
      end)
        .to match_array(timeline_project.phases.map do |record|
          record.as_json(except: ignore_attributes)
        end)
    end

    describe 'when a certain phase action is permitted only for groups' do
      let!(:source_project) { create(:project_with_active_ideation_phase) }
      let(:groups) { create_list(:group, 2) }
      let(:permission) do
        PermissionsService.new.update_all_permissions
        ParticipationContextService.new
          .get_participation_context(source_project).permissions
          .find_by(action: 'commenting_idea')
      end

      it 'copies the action groups permission' do
        permission.update!(permitted_by: 'groups', groups: groups)

        copied_project = service.copy(source_project)
        expect(copied_project.phases.first.permissions.find_by(action: 'commenting_idea').groups).to match_array(groups)
      end
    end

    describe 'when source project phase has file attachments' do
      let(:source_phase) { timeline_project.phases.order(:start_at).first }

      before { create_list(:phase_file, 2, phase: source_phase) }

      it 'creates associated copies of the file attachments' do
        copied_project = service.copy(timeline_project)
        copied_phase = copied_project.phases.order(:start_at).first

        expect(copied_phase.phase_files.count).to eq 2
        expect(copied_phase.phase_files.first.file.url).to include(source_phase.phase_files.first.name)

        expect(copied_phase.phase_files.map do |record|
          record.as_json(only: %i[ordering name])
        end)
          .to match_array(source_phase.phase_files.map do |record|
            record.as_json(only: %i[ordering name])
          end)
      end
    end

    it 'shifts timelines of phases to start first phase on day of copying' do
      freeze_time do
        phase1_start = timeline_project.phases.order(:start_at).first.start_at
        phase2_end = timeline_project.phases.order(:start_at).second.end_at

        today = Time.zone.today
        expected_shift = (today - phase1_start).days
        copied_project = service.copy(timeline_project)

        expect(copied_project.phases.order(:start_at).first.start_at).to eq today
        expect(copied_project.phases.order(:start_at).second.end_at).to eq phase2_end + expected_shift
      end
    end

    describe 'when source project has associated content builder layout' do
      let(:layout) { create(:layout, code: 'project_description') }

      it 'copies content builder layout' do
        copied_project = service.copy(layout.content_buildable)

        expect(copied_project.content_builder_layouts.first
          .as_json(only: %i[content_buildable_type code enabled]))
          .to eq(layout.as_json(only: %i[content_buildable_type code enabled]))
      end

      it 'copies associated layout images as new images, associated with copied layout' do
        images = create_list(:layout_image, 2)

        craftjs_str = ERB.new(File.read('spec/fixtures/craftjs_layout_with_2_images.json.erb'))
          .result_with_hash(code1: images[0].code, code2: images[1].code)

        layout.update(craftjs_jsonmultiloc: JSON.parse(craftjs_str))
        copied_project = service.copy(layout.content_buildable)

        new_image_codes =
          ContentBuilder::LayoutService.new.images(copied_project.content_builder_layouts.first).pluck(:code)

        expect(copied_project.content_builder_layouts.first
          .as_json(only: %i[content_buildable_type code enabled]))
          .to eq(layout.as_json(only: %i[content_buildable_type code enabled]))

        # Expect the copied layout's craftjs_jsonmultiloc to equal the source value, excluding the image codes (UUIDs)
        expect(
          copied_project.content_builder_layouts.first.craftjs_jsonmultiloc.to_json
          .gsub!(new_image_codes[0], '').gsub!(new_image_codes[1], '')
        ).to eq(
          layout.content_buildable.content_builder_layouts.first.craftjs_jsonmultiloc.to_json
          .gsub!(images[0].code, '').gsub!(images[1].code, '')
        )

        expect(new_image_codes.count).to eq 2
        expect(ContentBuilder::LayoutImage.find_by(code: new_image_codes[0])).to be_truthy
        expect(ContentBuilder::LayoutImage.find_by(code: new_image_codes[1])).to be_truthy
      end
    end
  end
end
