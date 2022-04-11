require "rails_helper"

describe MultiTenancy::TenantTemplateService do
  let(:service) { MultiTenancy::TenantTemplateService.new }

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
        create(:tenant, name: name, host: "#{name}.localhost", locales: locales, lifecycle: 'active')
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
              key: body_multiloc
              input_type: multiline_text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Debitis expedita qui nostrum.
              code: body_multiloc
            - resource_type: CustomForm
              resource_ref: *2
              key: title_multiloc
              input_type: text
              title_multiloc:
                en: Description
              description_multiloc:
                nl-BE: Minima et ipsa debitis.
              code: title_multiloc
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
end
