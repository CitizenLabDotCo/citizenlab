# frozen_string_literal: true

require 'rails_helper'

describe AdminApi::ProjectCopyService do
  let(:service) { described_class.new }

  describe 'project copy', slow_test: true do
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

      continuous_project = create :continuous_native_survey_project
      timeline_project = create :project_with_future_native_survey_phase
      survey_phase = timeline_project.phases.last
      ideation_phase = create :phase, participation_method: 'ideation', project: timeline_project
      form1 = create :custom_form, participation_context: continuous_project
      field1 = create :custom_field_linear_scale, :for_custom_form, resource: form1
      form2 = create :custom_form, participation_context: survey_phase
      field2 = create :custom_field, :for_custom_form, resource: form2

      create :idea, project: continuous_project, custom_field_values: { field1.key => 1 }
      create :idea, project: timeline_project, phases: [ideation_phase]
      create :idea, project: timeline_project, phases: [survey_phase], creation_phase: survey_phase, custom_field_values: { field2.key => 'My value' }

      template1 = service.export continuous_project, include_ideas: true
      template2 = service.export timeline_project, include_ideas: true

      tenant = create :tenant
      tenant.switch do
        IdeaStatus.create_defaults
        expect(Project.count).to eq 0

        service.import template1
        service.import template2

        expect(Project.count).to eq 2
        expect(Idea.count).to eq 3
        new_continuous_project = Project.where(process_type: 'continuous').first
        expect(new_continuous_project.custom_form.custom_fields.pluck(:input_type)).to eq ['linear_scale']
        new_timeline_project = Project.where(process_type: 'timeline').first
        new_survey_phase = new_timeline_project.phases.order(:start_at).last
        expect(new_survey_phase.custom_form.custom_fields.pluck(:input_type)).to eq ['linear_scale']
      end
    end
  end
end
