# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::TenantSerializer do
  subject(:tenant_serializer) do
    described_class.new(Tenant.current, uploads_full_urls: true)
  end

  describe '#run' do
    it 'successfully generates a tenant template from a given tenant' do
      load Rails.root.join('db/seeds.rb')
      localhost = Tenant.find_by(host: 'localhost')
      localhost.switch { MultiTenancy::Seeds::Runner.new.execute }

      tenant_serializer = described_class.new(localhost, uploads_full_urls: true)
      template = tenant_serializer.run(deserializer_format: true)

      locales = localhost.configuration.settings('core', 'locales')
      tenant = create(:test_tenant, locales: locales)

      tenant.switch do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
        expect(ContentBuilder::Layout.where(code: 'homepage').count).to be 1
        expect(Area.count).to be > 0
        expect(Comment.count).to be > 0
        expect(InternalComment.count).to be > 0
        expect(CustomField.count).to be > 0
        expect(CustomFieldOption.count).to be > 0
        expect(CustomForm.count).to be > 0
        expect(Event.count).to be > 0
        expect(EventImage.count).to be > 0
        expect(Events::Attendance.count).to be > 0
        expect(IdeaStatus.count).to be > 0
        expect(Reaction.count).to be > 0
        expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
        expect(Volunteering::Cause.count).to be 5
        expect(Volunteering::Volunteer.count).to be > 0
        expect(CustomMaps::MapConfig.count).to be 2
        expect(CustomMaps::Layer.count).to be 2
        expect(StaticPage.count).to be > 0
      end
    end

    it "doesn't include title_multiloc for NavBarItems without custom copy" do
      create(:nav_bar_item, code: 'home', title_multiloc: nil)
      template = tenant_serializer.run(deserializer_format: true)

      home_attributes = template.dig('models', 'nav_bar_item').find { |item| item['code'] == 'home' }
      expect(home_attributes['title_multiloc']).to be_blank
    end

    it 'can deal with nested admin publications in projects' do
      create(:project, title_multiloc: { 'en' => 'top-project' })
      create(
        :project,
        title_multiloc: { 'en' => 'nested-project' },
        folder: create(:project_folder, title_multiloc: { 'en' => 'folder' }).tap do |folder|
          folder.admin_publication.move_to_bottom
        end
      )

      serializer = described_class.new(Tenant.current, uploads_full_urls: true)
      template = serializer.run(deserializer_format: true)

      tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))
      tenant.switch do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
        expect(Project.count).to eq 2
        expect(AdminPublication.count).to eq 3
        expect(ProjectFolders::Folder.count).to eq 1
        top_project = Project.find_by(title_multiloc: { 'en' => 'top-project' })
        folder = ProjectFolders::Folder.find_by(title_multiloc: { 'en' => 'folder' })
        nested_project = Project.find_by(title_multiloc: { 'en' => 'nested-project' })
        expect(top_project.admin_publication.ordering).to eq 0
        expect(folder.admin_publication.ordering).to eq 1
        expect(nested_project.admin_publication.ordering).to eq 0
        expect(nested_project.folder).to eq folder
      end
    end

    # TODO: Re-enable after fixing inconsistent data on templates.
    # it "fails when there's a missing publication" do
    #   create(:project).admin_publication.delete

    #   expect do
    #     serializer = described_class.new(Tenant.current, uploads_full_urls: true)
    #     template = serializer.run(deserializer_format: true)

    #     tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))
    #     tenant.switch do
    #       MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
    #     end
    #   end.to raise_error(RuntimeError) # Error class subject to change
    # end

    it 'can deal with missing authors' do
      idea = create(:idea, author: nil)
      create(:comment, idea: idea)

      serializer = described_class.new(Tenant.current, uploads_full_urls: true)
      template = serializer.run(deserializer_format: true)

      tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))
      tenant.switch do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
        expect(Comment.count).to eq 1
      end
    end

    it 'includes a reference to an existing static_page header_bg' do
      create(:static_page, header_bg: Rails.root.join('spec/fixtures/header.jpg').open)

      template = tenant_serializer.run(deserializer_format: true)

      expect(template['models']).to be_present
      expect(template.dig('models', 'static_page', 0, 'remote_header_bg_url')).to match(%r{/uploads/.*/static_page/header_bg/.*.jpg})
    end

    it 'successfully copies over cosponsorships' do
      proposal = create(:proposal, title_multiloc: { en: 'proposal-1' })
      user = create(:user, email: 'user-1@g.com')
      create(:cosponsorship, user: user, idea: proposal)

      template = tenant_serializer.run(deserializer_format: true)

      tenant = create(:tenant)
      tenant.switch do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)

        expect(Cosponsorship.count).to be 1

        cosponsorship = Cosponsorship.first
        expect(cosponsorship.user.email).to eq user.email
        expect(cosponsorship.idea.title_multiloc).to eq proposal.title_multiloc
      end
    end

    it 'successfully copies over native surveys and responses' do
      create(:idea_status_proposed)

      timeline_project = create(:project_with_future_native_survey_phase)
      survey_phase = timeline_project.phases.last
      ideation_phase = create(:phase, participation_method: 'ideation', project: timeline_project)
      form = create(:custom_form, participation_context: survey_phase)
      field = create(:custom_field, :for_custom_form, resource: form)

      create(:idea, project: timeline_project, phases: [ideation_phase])
      create(:idea, project: timeline_project, phases: [survey_phase], creation_phase: survey_phase, custom_field_values: { field.key => 'My value' })

      template = tenant_serializer.run(deserializer_format: true)

      tenant = create(:tenant)
      tenant.switch do
        create(:idea_status_proposed)
        expect(Project.count).to eq 0

        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)

        expect(Project.count).to eq 1
        expect(Idea.count).to eq 2

        new_timeline_project = Project.first
        new_survey_phase = new_timeline_project.phases.order(:start_at).last
        expect(new_timeline_project.ideas.map(&:creation_phase_id)).to match_array [nil, new_survey_phase.id]
        expect(new_survey_phase.custom_form.custom_fields.pluck(:input_type)).to eq ['text']
        new_field = new_survey_phase.custom_form.custom_fields.first
        expect(new_survey_phase.ideas_count).to eq 1
        expect(new_survey_phase.ideas.first.custom_field_values[new_field.key]).to eq 'My value'
      end
    end

    it 'successfully exports custom field' do
      description_multiloc = {
        'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
      }
      field = create(:custom_field_page, :for_custom_form, description_multiloc: description_multiloc)
      field.update! description_multiloc: TextImageService.new.swap_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)

      template = tenant_serializer.run(deserializer_format: true)

      expect(template['models']['custom_field'].size).to eq 1
      expect(template['models']['custom_field'].first).to match hash_including(
        'key' => field.key,
        'input_type' => field.input_type,
        'title_multiloc' => field.title_multiloc,
        'random_option_ordering' => field.random_option_ordering,
        'dropdown_layout' => field.dropdown_layout,
        'description_multiloc' => field.description_multiloc,
        'page_layout' => field.page_layout
      )
    end

    it 'successfully exports map config & layers related to a custom field' do
      field = create(:custom_field_point, :for_custom_form)
      map_config = create(:map_config, :with_positioning, :with_geojson_layers, mappable: field)
      layer = map_config.layers.first

      template = tenant_serializer.run(deserializer_format: true)

      expect(template['models']['custom_field'].size).to eq 1
      expect(template['models']['custom_maps/map_config'].first).to match hash_including(
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'mappable_ref' => hash_including('resource_ref' => an_instance_of(Hash)),
        'center_geojson' => map_config.center_geojson
      )
      expect(template['models']['custom_maps/layer'].first).to match hash_including(
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'map_config_ref' => hash_including('mappable_ref' => an_instance_of(Hash)),
        'geojson' => layer.geojson
      )
    end

    it 'successfully exports custom field option images' do
      field = create(:custom_field_select, :for_custom_form)
      option = create(:custom_field_option, custom_field: field, image: create(:custom_field_option_image))
      template = tenant_serializer.run(deserializer_format: true)

      expect(template['models']['custom_field_option_image'].size).to eq 1
      expect(template['models']['custom_field_option_image'].first).to match hash_including(
        'created_at' => an_instance_of(String),
        'updated_at' => an_instance_of(String),
        'custom_field_option_ref' => hash_including('custom_field_ref' => an_instance_of(Hash)),
        'remote_image_url' => an_instance_of(String),
        'ordering' => option.image.ordering
      )
    end

    it 'skips custom field values with ID references' do
      project = create(:single_phase_native_survey_project)
      custom_form = create(:custom_form, participation_context: project.phases.first)
      supported_fields = %i[custom_field_number custom_field_linear_scale custom_field_rating custom_field_checkbox].map do |factory|
        create(factory, :for_custom_form, resource: custom_form)
      end
      unsupported_field = create(:custom_field, :for_custom_form, input_type: 'file_upload', resource: custom_form)
      create(:idea_status_proposed)
      response = create(:native_survey_response, project: project)
      custom_field_values = {
        supported_fields[0].key => 7,
        supported_fields[1].key => 1,
        unsupported_field.key => create(:file_upload, idea: response).id,
        supported_fields[2].key => false
      }
      response.update! custom_field_values: custom_field_values

      template = tenant_serializer.run(deserializer_format: true)

      expected_custom_field_values = {
        supported_fields[0].key => 7,
        supported_fields[1].key => 1,
        supported_fields[2].key => false
      }
      expect(template['models']['idea'].size).to eq 1
      expect(template['models']['idea'].first['custom_field_values']).to match expected_custom_field_values
    end

    it 'copies exact :ordering values of records for models that use acts_as_list gem' do
      project = create(:single_phase_volunteering_project, title_multiloc: { en: 'source project' })
      phase = project.phases.first
      create_list(
        :cause,
        5,
        phase: phase,
        ordering: rand(10) # Introduce some randomness, with the acts_as_list gem handling collisions & sequencing
      )

      ordering_of_source_causes = phase.causes.order(:title_multiloc['en']).pluck(:ordering)
      template = tenant_serializer.run(deserializer_format: true)
      tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))

      Apartment::Tenant.switch(tenant.schema_name) do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)

        copied_phase = Project.find_by(title_multiloc: project.title_multiloc).phases.first
        expect(copied_phase.causes.order(:title_multiloc['en']).pluck(:ordering))
          .to eq(ordering_of_source_causes)
      end
    end

    it 'can deal with baskets - with or without users' do
      project = create(:single_phase_multiple_voting_project)
      idea = create(:idea, project: project)
      user = create(:user)
      basket1 = create(:basket, phase: project.phases.first, user: user)
      basket2 = create(:basket, phase: project.phases.first, user: nil)
      create(:baskets_idea, idea: idea, basket: basket1, votes: 1)
      create(:baskets_idea, idea: idea, basket: basket2, votes: 2)

      serializer = described_class.new(Tenant.current, uploads_full_urls: true)
      template = serializer.run(deserializer_format: true)

      tenant = create(:tenant, locales: AppConfiguration.instance.settings('core', 'locales'))
      tenant.switch do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
        expect(Basket.count).to eq 2
        expect(BasketsIdea.count).to eq 2
        expect(BasketsIdea.all.pluck(:votes)).to match_array([1, 2])
      end
    end

    it 'adds a unique ID to SSO users with no email address' do
      create(:user, email: nil, identities: [create(:identity, provider: 'fake_sso')])
      template = tenant_serializer.run(deserializer_format: true)

      # Main user
      expect(template['models']['user'].first['email']).not_to be_nil
      expect(template['models']['user'].first['unique_code']).to be_nil

      # SSO user added above
      expect(template['models']['user'].last['email']).to be_nil
      expect(template['models']['user'].last['unique_code']).not_to be_nil
    end

    it 'changes "verified" permissions to "user" permissions' do
      SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
      create(:permission, :by_admins_moderators)
      create(:permission, :by_verified)
      template = tenant_serializer.run(deserializer_format: true)
      expect(template['models']['permission'].first['permitted_by']).to eq 'admins_moderators' # Not changed
      expect(template['models']['permission'].last['permitted_by']).to eq 'users' # Changed
    end
  end
end
