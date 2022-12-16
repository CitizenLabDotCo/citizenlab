# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::Serializer do
  describe '#run', slow_test: true do
    it 'successfully generates a tenant template from a given tenant' do
      load Rails.root.join('db/seeds.rb')
      localhost = Tenant.find_by(host: 'localhost')
      settings = localhost.settings
      settings['core']['locales'] = AppConfiguration.instance.settings('core', 'locales')
      localhost.update!(settings: settings) # TODO: OS how will tenant templates work?
      Apartment::Tenant.switch('localhost') do
        load Rails.root.join('db/seeds.rb')
      end
      serializer = described_class.new(Tenant.find_by(host: 'localhost'))
      template = serializer.run
      tenant = create :tenant, locales: localhost.settings.dig('core', 'locales')
      Apartment::Tenant.switch(tenant.schema_name) do
        MultiTenancy::TenantTemplateService.new.apply_template template
        expect(HomePage.count).to be 1
        expect(Area.count).to be > 0
        expect(Comment.count).to be > 0
        expect(CustomFieldOption.count).to be > 0
        expect(Event.count).to be > 0
        expect(IdeaStatus.count).to be > 0
        expect(Vote.count).to be > 0
        expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
        expect(Volunteering::Cause.count).to be 5
        expect(Volunteering::Volunteer.count).to be > 0
        expect(CustomMaps::MapConfig.count).to be 1
        expect(CustomMaps::Layer.count).to be 2
        expect(CustomMaps::LegendItem.count).to be 7
      end
    end

    it 'correctly generates and links attributes references' do
      create(:project_folder, projects: create_list(:project, 2))
      serializer = described_class.new(Tenant.current)
      template = serializer.run

      admin_publication_attributes = template.dig('models',
        'project_folders/folder').first['admin_publication_attributes']
      expect(admin_publication_attributes).to be_present
      template.dig('models', 'project').each do |pj|
        expect(pj.dig('admin_publication_attributes', 'parent_ref')).to eq admin_publication_attributes
      end
    end

    it "doesn't include title_multiloc for NavBarItems without custom copy" do
      create(:nav_bar_item, code: 'home', title_multiloc: nil)
      serializer = described_class.new(Tenant.current)
      template = serializer.run

      home_attributes = template.dig('models', 'nav_bar_item').find { |item| item['code'] == 'home' }
      expect(home_attributes['title_multiloc']).to be_blank
    end

    it 'can deal with projects without admin publication' do
      # The changes introduced by ticket CL-793 can be
      # reverted once the issue with projects losing their
      # admin publications is solved.

      project = create :project
      project.admin_publication.delete
      expect(project.reload).to be_present
      serializer = described_class.new(Tenant.current)
      template = serializer.run

      expect(template['models']).to be_present
      expect(template.dig('models', 'project', 0, 'admin_publication_attributes')).to be_nil
    end

    it 'can deal with missing authors' do
      idea = create :idea, author: nil
      create :comment, post: idea

      serializer = described_class.new Tenant.current
      template = serializer.run
      tenant = create :tenant, locales: Tenant.current.settings.dig('core', 'locales')
      Apartment::Tenant.switch(tenant.schema_name) do
        MultiTenancy::TenantTemplateService.new.apply_template template
        expect(Comment.count).to eq 1
      end
    end

    it 'includes a reference to an existing home_page header_bg' do
      create(:home_page, header_bg: File.open(Rails.root.join('spec/fixtures/header.jpg')))

      serializer = described_class.new(Tenant.current)
      template = serializer.run

      expect(template['models']).to be_present
      expect(template.dig('models', 'home_page', 0, 'remote_header_bg_url')).to match(%r{/uploads/.*/home_page/header_bg/.*.jpg})
    end

    it 'includes a reference to an existing static_page header_bg' do
      create(:static_page, header_bg: File.open(Rails.root.join('spec/fixtures/header.jpg')))

      serializer = described_class.new(Tenant.current)
      template = serializer.run

      expect(template['models']).to be_present
      expect(template.dig('models', 'static_page', 0, 'remote_header_bg_url')).to match(%r{/uploads/.*/static_page/header_bg/.*.jpg})
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

      serializer = described_class.new Tenant.current
      template = serializer.run

      tenant = create :tenant
      tenant.switch do
        IdeaStatus.create_defaults
        expect(Project.count).to eq 0

        MultiTenancy::TenantTemplateService.new.apply_template template

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
      field = create :custom_field, :for_custom_form, description_multiloc: description_multiloc
      field.update! description_multiloc: TextImageService.new.swap_data_images(field, :description_multiloc)

      serializer = described_class.new Tenant.current
      template = serializer.run

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
  end
end
