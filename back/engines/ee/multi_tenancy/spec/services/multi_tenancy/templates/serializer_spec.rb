require 'rails_helper'

describe MultiTenancy::Templates::Serializer do
  describe '#run' do
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

    it 'can deal with projects with no admin publication' do
      # The changes introduced by ticket CL-793 can be
      # reverted once the issue with projects losing their
      # admin publications is solved.

      project = create :project
      project.admin_publication.delete
      expect(project.reload).to be_present
      serializer = described_class.new(Tenant.current)
      template = serializer.run

      expect(template['models']).to be_present
    end
  end
end
