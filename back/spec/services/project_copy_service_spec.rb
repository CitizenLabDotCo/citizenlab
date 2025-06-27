# frozen_string_literal: true

require 'rails_helper'

describe ProjectCopyService do
  let(:service) { described_class.new }

  before { stub_easy_translate! }

  describe 'project copy' do
    it 'works' do
      load Rails.root.join('db/seeds.rb')
      Apartment::Tenant.switch('localhost') do
        load Rails.root.join('db/seeds.rb')
      end
      create(:idea_status, code: 'proposed')
      expected_count = 0
      slugs = [nil, 'Your coolest tricks to cool down the city']
      [false, true].each do |include_ideas|
        slugs.each do |new_slug|
          template = Apartment::Tenant.switch('localhost') do
            project = Project.all.sample
            service.export project, include_ideas: include_ideas, new_slug: new_slug
          end

          service.import template
          expected_count += 1
          expect(Project.count).to eq expected_count
        end
      end
    end

    it 'successfully copies over native surveys and responses' do
      create(:idea_status_proposed)

      open_ended_project = create(:single_phase_native_survey_project, title_multiloc: { en: 'open ended' })
      form1 = create(:custom_form, participation_context: open_ended_project.phases.first)
      field1 = create(:custom_field_linear_scale, :for_custom_form, resource: form1)
      create(:idea, project: open_ended_project, custom_field_values: { field1.key => 1 }, phases: open_ended_project.phases, creation_phase: open_ended_project.phases.first)

      two_phase_project = create(:project_with_future_native_survey_phase, title_multiloc: { en: 'two phase' })
      survey_phase = two_phase_project.phases.last
      ideation_phase = create(:phase, participation_method: 'ideation', project: two_phase_project)
      two_phase_project.phases << ideation_phase
      form2 = create(:custom_form, participation_context: survey_phase)
      field2 = create(:custom_field, :for_custom_form, resource: form2)
      create(:idea, project: two_phase_project, phases: [ideation_phase])
      create(:idea, project: two_phase_project, phases: [survey_phase], creation_phase: survey_phase, custom_field_values: { field2.key => 'My value' })

      template1 = service.export open_ended_project, include_ideas: true
      template2 = service.export two_phase_project, include_ideas: true

      tenant = create(:tenant)
      tenant.switch do
        create(:idea_status_proposed)
        expect(Project.count).to eq 0

        service.import template1
        service.import template2

        expect(Project.count).to eq 2
        expect(Phase.count).to eq 3
        expect(Idea.count).to eq 3

        new_open_ended_project = Project.find_by(title_multiloc: { en: 'open ended' })
        expect(new_open_ended_project.phases.first.custom_form.custom_fields.pluck(:input_type)).to eq ['linear_scale']
        new_field1 = new_open_ended_project.phases.first.custom_form.custom_fields.first
        expect(new_open_ended_project.ideas_count).to eq 1
        expect(new_open_ended_project.ideas.first.custom_field_values[new_field1.key]).to eq 1

        new_two_phase_project = Project.find_by(title_multiloc: { en: 'two phase' })
        new_survey_phase = new_two_phase_project.phases.order(:start_at).last
        expect(new_two_phase_project.ideas.map(&:creation_phase_id)).to match_array [nil, new_survey_phase.id]
        expect(new_survey_phase.custom_form.custom_fields.pluck(:input_type)).to eq ['text']
        new_field2 = new_survey_phase.custom_form.custom_fields.first
        expect(new_survey_phase.ideas_count).to eq 1
        expect(new_survey_phase.ideas.first.custom_field_values[new_field2.key]).to eq 'My value'
      end
    end

    it 'successfully exports custom field text images' do
      description_multiloc = {
        'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
      }
      field = create(:custom_field, :for_custom_form, description_multiloc: description_multiloc)
      field.update! description_multiloc: TextImageService.new.swap_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)

      template = service.export field.resource.participation_context

      expect(template['models']['custom_field'].size).to eq 1
      expect(template['models']['custom_field'].first).to match hash_including(
        'key' => field.key,
        'input_type' => field.input_type,
        'title_multiloc' => field.title_multiloc,
        'description_multiloc' => field.description_multiloc,
        'random_option_ordering' => field.random_option_ordering,
        'dropdown_layout' => field.dropdown_layout,
        'text_images_attributes' => [
          hash_including(
            'imageable_field' => 'description_multiloc',
            'remote_image_url' => match(%r{/uploads/#{uuid_regex}/text_image/image/#{uuid_regex}/#{uuid_regex}.gif})
          )
        ]
      )
    end

    it 'successfully exports custom field option images' do
      field = create(:custom_field_select, :for_custom_form)
      option = create(:custom_field_option, custom_field: field, image: create(:custom_field_option_image))
      template = service.export field.resource.participation_context

      expect(template['models']['custom_field_option_image'].size).to eq 1
      expect(template['models']['custom_field_option_image'].first).to match hash_including(
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'custom_field_option_ref' => hash_including('custom_field_ref' => an_instance_of(Hash)),
        'remote_image_url' => an_instance_of(String),
        'ordering' => option.image.ordering
      )
    end

    it 'successfully exports matrix custom fields' do
      field = create(:custom_field_matrix_linear_scale, :for_custom_form)
      template = service.export field.resource.participation_context

      expect(template.dig('models', 'custom_field', 0, 'input_type')).to eq 'matrix_linear_scale'
      expect(template['models']['custom_field_matrix_statement'].size).to eq 2
      expect(template['models']['custom_field_matrix_statement']).to match_array [
        hash_including(
          'title_multiloc' => { 'en' => 'We should send more animals into space' },
          'key' => 'send_more_animals_to_space',
          'ordering' => 0
        ),
        hash_including(
          'title_multiloc' => { 'en' => 'We should ride our bicycles more often' },
          'key' => 'ride_bicycles_more_often',
          'ordering' => 1
        )
      ]
    end

    it 'skips custom field values with ID references' do
      create(:idea_status_proposed)
      project = create(:single_phase_native_survey_project)
      custom_form = create(:custom_form, participation_context: project)
      supported_fields = %i[custom_field_number custom_field_linear_scale custom_field_checkbox].map do |factory|
        create(factory, :for_custom_form, resource: custom_form)
      end
      unsupported_field1 = create(:custom_field, :for_custom_form, input_type: 'file_upload', resource: custom_form)
      unsupported_field2 = create(:custom_field, :for_custom_form, input_type: 'shapefile_upload', resource: custom_form)
      response = create(:native_survey_response, project: project)
      custom_field_values = {
        supported_fields[0].key => 7,
        supported_fields[1].key => 1,
        unsupported_field1.key => create(:file_upload, idea: response).id,
        unsupported_field2.key => create(:file_upload, idea: response).id,
        supported_fields[2].key => false
      }
      response.update! custom_field_values: custom_field_values

      template = service.export project.reload, include_ideas: true

      expected_custom_field_values = {
        supported_fields[0].key => 7,
        supported_fields[1].key => 1,
        supported_fields[2].key => false
      }
      expect(template['models']['idea'].size).to eq 1
      expect(template['models']['idea'].first['custom_field_values']).to match expected_custom_field_values
    end

    it 'successfully copies map_configs associated with phase-level form custom_fields, and their layers' do
      open_ended_project = create(:single_phase_native_survey_project, title_multiloc: { en: 'open ended' })
      form1 = create(:custom_form, participation_context: open_ended_project.phases.first)
      page_field = create(:custom_field_page, :for_custom_form, resource: form1)
      map_config1 = create(:map_config, zoom_level: 15, mappable: page_field)
      layer1 = create(:geojson_layer, map_config: map_config1, title_multiloc: { en: 'Layer 1' })
      point_field = create(:custom_field_point, :for_custom_form, resource: form1)
      map_config2 = create(:map_config, zoom_level: 17, mappable: point_field)
      layer2 = create(:geojson_layer, map_config: map_config2, title_multiloc: { en: 'Layer 2' })
      layer3 = create(:esri_feature_layer, map_config: map_config2, title_multiloc: { en: 'Layer 3' })

      template = service.export open_ended_project

      expect(template['models']['custom_field'].size).to eq 2
      expect(template['models']['custom_maps/map_config'].size).to eq 2
      expect(template['models']['custom_maps/layer'].size).to eq 3

      tenant = create(:tenant)
      tenant.switch do
        expect(CustomMaps::MapConfig.count).to eq 0
        expect(CustomMaps::Layer.count).to eq 0

        service.import template

        expect(CustomMaps::MapConfig.count).to eq 2
        expect(CustomMaps::MapConfig.all.pluck(:zoom_level))
          .to match_array [map_config1.zoom_level, map_config2.zoom_level]

        expect(CustomMaps::Layer.count).to eq 3
        expect(CustomMaps::Layer.all.pluck(:title_multiloc))
          .to match_array [layer1.title_multiloc, layer2.title_multiloc, layer3.title_multiloc]
      end
    end

    it 'successfully copies map_configs associated with project-level form custom_fields, and their layers' do
      project = create(:project)
      form1 = create(:custom_form, participation_context: project)
      field1 = create(:custom_field_point, :for_custom_form, resource: form1)
      map_config = create(:map_config, zoom_level: 17, mappable: field1)
      layer1 = create(:geojson_layer, map_config: map_config, title_multiloc: { en: 'Layer 1' })
      layer2 = create(:geojson_layer, map_config: map_config, title_multiloc: { en: 'Layer 2' })

      template = service.export project

      expect(template['models']['custom_maps/map_config'].size).to eq 1
      expect(template['models']['custom_maps/layer'].size).to eq 2

      tenant = create(:tenant)
      tenant.switch do
        expect(CustomMaps::MapConfig.count).to eq 0
        expect(CustomMaps::Layer.count).to eq 0

        service.import template

        expect(CustomMaps::MapConfig.count).to eq 1
        expect(CustomMaps::MapConfig.first.zoom_level).to eq map_config.zoom_level

        expect(CustomMaps::Layer.count).to eq 2
        expect(CustomMaps::Layer.all.pluck(:title_multiloc))
          .to match_array [layer1.title_multiloc, layer2.title_multiloc]
      end
    end

    it 'successfully copies map_configs associated with projects, and their layers' do
      project = create(:project)
      map_config = create(:map_config, zoom_level: 17, mappable: project)
      layer = create(:geojson_layer, map_config: map_config, title_multiloc: { en: 'Layer title' })

      template = service.export project

      expect(template['models']['custom_maps/map_config'].size).to eq 1
      expect(template['models']['custom_maps/layer'].size).to eq 1

      tenant = create(:tenant)
      tenant.switch do
        expect(CustomMaps::MapConfig.count).to eq 0
        expect(CustomMaps::Layer.count).to eq 0

        service.import template

        expect(CustomMaps::MapConfig.count).to eq 1
        expect(CustomMaps::MapConfig.first.zoom_level).to eq map_config.zoom_level

        expect(CustomMaps::Layer.count).to eq 1
        expect(CustomMaps::Layer.first.title_multiloc).to eq layer.title_multiloc
      end
    end

    it 'includes volunteers' do
      cause = create(:cause)
      volunteer = create(:user)
      cause.volunteers.create!(user: volunteer)

      template = service.export cause.phase.project, anonymize_users: false, include_ideas: true

      expect(template['models']['volunteering/volunteer'].size).to eq 1
      expect(template['models']['volunteering/volunteer'].first).to match({
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'cause_ref' => hash_including(
          'title_multiloc' => cause.title_multiloc,
          'description_multiloc' => cause.description_multiloc,
          'ordering' => cause.ordering
        ),
        'user_ref' => hash_including(
          'first_name' => volunteer.first_name,
          'last_name' => volunteer.last_name,
          'email' => volunteer.email
        )
      })
    end

    it 'includes events' do
      event = create(:event)
      attendee = create(:user)
      event.attendances.create!(attendee: attendee)

      template = service.export event.project, anonymize_users: false, include_ideas: true

      expected_event = {
        'title_multiloc' => event.title_multiloc,
        'description_multiloc' => event.description_multiloc,
        'location_multiloc' => event.location_multiloc,
        'location_point_geojson' => event.location_point_geojson,
        'online_link' => event.online_link,
        'address_1' => event.address_1,
        'address_2_multiloc' => event.address_2_multiloc,
        'using_url' => event.using_url,
        'attend_button_multiloc' => event.attend_button_multiloc
      }
      expect(template['models']['event'].size).to eq 1
      expect(template['models']['event'].first).to match(hash_including(expected_event))
      expect(template['models']['events/attendance'].size).to eq 1
      expect(template['models']['events/attendance'].first).to match({
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'event_ref' => hash_including(expected_event),
        'attendee_ref' => hash_including(
          'first_name' => attendee.first_name,
          'last_name' => attendee.last_name,
          'email' => attendee.email
        )
      })
    end

    it 'includes phases with no end date' do
      project = create(:project_with_active_ideation_phase)
      project.phases.last.update!(end_at: nil)

      template = service.export project, anonymize_users: false, include_ideas: true

      expect(template['models']['phase'].size).to eq 1
      expect(template['models']['phase'].last[:end_at]).to be_nil
    end

    describe 'when copying records for models that use acts_as_list gem' do
      it 'copies exact :ordering values' do
        project = create(:single_phase_ideation_project)
        custom_form = create(
          :custom_form,
          participation_context_id: project.id,
          participation_context_type: 'Project'
        )
        create_list(
          :custom_field_select,
          5,
          :with_options,
          resource_type: 'CustomForm',
          resource_id: custom_form.id,
          ordering: rand(10) # Introduce some randomness, with the acts_as_list gem handling collisions & sequencing
        )

        template = service.export project
        copied_project = service.import template

        expect(copied_project.custom_form.custom_fields.order(:key).pluck(:ordering))
          .to eq(project.custom_form.custom_fields.order(:key).pluck(:ordering))
      end
    end
  end

  private

  def stub_easy_translate!
    allow(EasyTranslate).to receive(:translate) do |_, options|
      translation = {
        'en' => '<strong>Health & Wellness</strong>',
        'fr' => '<strong>Santé &amp; Bien-être</strong>',
        'nl' => ''
      }[options[:to]]
      translation || raise(EasyTranslate::EasyTranslateException, 'Locale not supported!')
    end
  end
end
