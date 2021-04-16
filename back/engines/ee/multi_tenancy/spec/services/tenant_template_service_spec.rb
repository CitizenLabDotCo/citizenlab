require "rails_helper"

describe MultiTenancy::TenantTemplateService do
  let(:service) { MultiTenancy::TenantTemplateService.new }

  before do
  end

  describe "available_templates" do

    it "returns a non-empty list" do
      expect(service.available_templates.values.flatten.uniq).to_not be_empty
    end

  end

  describe "resolve_and_apply_template", template_test: true do
    it "raises an error if the requested template was not found" do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist', external_subfolder: false)}.to raise_error
    end

    it "raises an error if the requested template was not found" do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist', external_subfolder: 'test')}.to raise_error
    end
  end

  describe "resolve_and_apply_template", slow_test: true do
    MultiTenancy::TenantTemplateService.new.available_templates[:internal].map do |template|
      it "Successfully applies '#{template}' template" do
        name = template.split('_').join('')
        locales = MultiTenancy::TenantTemplateService.new.required_locales(template, external_subfolder: 'test')
        locales = ['en'] if locales.blank?
        Tenant.create!(
          name: name, 
          host: "#{name}.localhost", 
          settings: {core: {allowed: true, enabled: true, locales: locales}}
          )
        Apartment::Tenant.switch("#{name}_localhost") do
          service.resolve_and_apply_template template
        end
      end
    end

    it "raises an error if the requested template was not found" do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist')}.to raise_error
    end
  end

  describe "apply_template", slow_test: true do
    it "associates refs correctly, when the target of the ref has exactly the same attributes" do
      yml = <<~YAML
        ---
        models:
          custom_form:
          - &1
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
          - &2
            created_at: 2020-02-18 22:46:33 UTC
            updated_at: 2020-02-18 22:46:33 UTC
          custom_field:
            - resource_type: CustomForm
              resource_ref: *1
              key: body
              input_type: multiline_text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Debitis expedita qui nostrum.
              code: body
            - resource_type: CustomForm
              resource_ref: *2
              key: title
              input_type: text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Minima et ipsa debitis.
              code: title
        YAML
        template = YAML.load(yml)

        service.apply_template(template)

        expect(CustomForm.count).to eq 2
        expect(CustomField.count).to eq 2
        expect(CustomField.all.map(&:resource)).to match_array CustomForm.all
    end

    it "associates attribute refs correctly" do
      yml = <<~YAML
        ---
        models:
          project_folder:
          - title_multiloc:
              en: Folder title
            admin_publication_attributes: &1
              publication_status: published
          project:
            - title_multiloc:
                en: Project 1 title
              admin_publication_attributes:
                publication_status: published
                parent_attributes_ref: *1
            - title_multiloc:
                en: Project 2 title
              admin_publication_attributes:
                publication_status: published
                parent_attributes_ref: *1
        YAML
        template = YAML.load(yml)

        service.apply_template(template)

        expect(ProjectFolders::Folder.count).to eq 1
        expect(Project.count).to eq 2
        expect(Project.all.map{|pj| pj.folder&.id}.uniq).to eq [ProjectFolders::Folder.first.id]
    end
  end

  describe "tenant_to_template", slow_test: true do
    it "successfully generates a tenant template from a given tenant" do
      load Rails.root.join("db","seeds.rb")
      localhost = Tenant.find_by(host: 'localhost')
      settings = localhost.settings
      settings['core']['locales'] = AppConfiguration.instance.settings('core', 'locales')
      localhost.update!(settings: settings) # TODO OS how will tenant templates work?
      Apartment::Tenant.switch('localhost') do
        load Rails.root.join("db","seeds.rb")
      end
      template = service.tenant_to_template Tenant.find_by(host: 'localhost')
      service.apply_template template
      expect(Area.count).to be > 0
      expect(AreasIdea.count).to be > 0
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

    it "correctly generates and links attributes references" do
      create(:project_folder, projects: create_list(:project, 2))
      template = service.tenant_to_template Tenant.current

      admin_publication_attributes = template.dig('models', 'project_folders/folder').first['admin_publication_attributes']
      expect(admin_publication_attributes).to be_present
      template.dig('models', 'project').each do |pj|
        expect(pj.dig('admin_publication_attributes', 'parent_ref')).to eq admin_publication_attributes
      end
    end
  end



end
