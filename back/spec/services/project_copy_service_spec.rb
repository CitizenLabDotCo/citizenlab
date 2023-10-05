# frozen_string_literal: true

require 'rails_helper'

describe ProjectCopyService do
  let(:service) { described_class.new }

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
      IdeaStatus.create_defaults

      continuous_project = create(:continuous_native_survey_project)
      timeline_project = create(:project_with_future_native_survey_phase)
      survey_phase = timeline_project.phases.last
      ideation_phase = create(:phase, participation_method: 'ideation', project: timeline_project)
      form1 = create(:custom_form, participation_context: continuous_project)
      field1 = create(:custom_field_linear_scale, :for_custom_form, resource: form1)
      form2 = create(:custom_form, participation_context: survey_phase)
      field2 = create(:custom_field, :for_custom_form, resource: form2)

      create(:idea, project: continuous_project, custom_field_values: { field1.key => 1 })
      create(:idea, project: timeline_project, phases: [ideation_phase])
      create(:idea, project: timeline_project, phases: [survey_phase], creation_phase: survey_phase, custom_field_values: { field2.key => 'My value' })

      template1 = service.export continuous_project, include_ideas: true
      template2 = service.export timeline_project, include_ideas: true

      tenant = create(:tenant)
      tenant.switch do
        IdeaStatus.create_defaults
        expect(Project.count).to eq 0

        service.import template1
        service.import template2

        expect(Project.count).to eq 2
        expect(Idea.count).to eq 3
        new_continuous_project = Project.where(process_type: 'continuous').first
        expect(new_continuous_project.custom_form.custom_fields.pluck(:input_type)).to eq ['linear_scale']
        new_field1 = new_continuous_project.custom_form.custom_fields.first
        expect(new_continuous_project.ideas_count).to eq 1
        expect(new_continuous_project.ideas.first.custom_field_values[new_field1.key]).to eq 1

        new_timeline_project = Project.where(process_type: 'timeline').first
        new_survey_phase = new_timeline_project.phases.order(:start_at).last
        expect(new_timeline_project.ideas.map(&:creation_phase_id)).to match_array [nil, new_survey_phase.id]
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
      field.update! description_multiloc: TextImageService.new.swap_data_images(field, :description_multiloc)

      template = service.export field.resource.participation_context

      expect(template['models']['custom_field'].size).to eq 1
      expect(template['models']['custom_field'].first).to match hash_including(
        'key' => field.key,
        'input_type' => field.input_type,
        'title_multiloc' => field.title_multiloc,
        'description_multiloc' => field.description_multiloc,
        'text_images_attributes' => [
          hash_including(
            'imageable_field' => 'description_multiloc',
            'remote_image_url' => match(%r{/uploads/#{uuid_regex}/text_image/image/#{uuid_regex}/#{uuid_regex}.gif})
          )
        ]
      )
    end

    it 'skips custom field values with ID references' do
      project = create(:continuous_native_survey_project)
      custom_form = create(:custom_form, participation_context: project)
      supported_fields = %i[custom_field_number custom_field_linear_scale custom_field_checkbox].map do |factory|
        create(factory, :for_custom_form, resource: custom_form)
      end
      unsupported_field = create(:custom_field, :for_custom_form, input_type: 'file_upload', resource: custom_form)
      response = create(:native_survey_response, project: project)
      custom_field_values = {
        supported_fields[0].key => 7,
        supported_fields[1].key => 1,
        unsupported_field.key => create(:file_upload, idea: response).id,
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

    it 'includes volunteers' do
      cause = create(:cause)
      cause.update!(volunteers [create(:user)])

      template = service.export cause.participation_context.project

      expect(template['models']['custom_field'].size).to eq 1
      expect(template['models']['custom_field'].first).to match hash_including(
        'key' => field.key,
        'input_type' => field.input_type,
        'title_multiloc' => field.title_multiloc,
        'description_multiloc' => field.description_multiloc,
        'text_images_attributes' => [
          hash_including(
            'imageable_field' => 'description_multiloc',
            'remote_image_url' => match(%r{/uploads/#{uuid_regex}/text_image/image/#{uuid_regex}/#{uuid_regex}.gif})
          )
        ]
      )
    end

    describe 'when copying records for models that use acts_as_list gem' do
      it 'copies exact :ordering values' do
        project = create(:continuous_project)
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
end
