require "rails_helper"

describe TenantTemplateService do
  let(:service) { TenantTemplateService.new }

  before do
  end

  describe "available_templates" do

    it "returns a non-empty list" do
      expect(service.available_templates.values.flatten.uniq).to_not be_empty
    end

  end

  describe "resolve_and_apply_template", template_test: true do
    
    TenantTemplateService.new.available_templates(external_subfolder: 'test')[:external].map do |template|
      it "Successfully applies '#{template}' template" do 
        locales = TenantTemplateService.new.required_locales(template, external_subfolder: 'test')
        locales = ['en'] if locales.blank?
        name = template.split('_').join('')
        Tenant.create!({
          name: name,
          host: "#{name}.localhost",
          logo: Rails.root.join("spec/fixtures/logo.png").open,
          header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
          settings: {
            core: {
              allowed: true,
              enabled: true,
              locales: locales,
              organization_type: 'medium_city',
              organization_name: locales.map { |locale|
                [locale,Faker::Address.city]
              }.to_h,
              timezone: "Europe/Brussels",
              color_main: Faker::Color.hex_color,
              color_secondary: Faker::Color.hex_color,
              color_text: Faker::Color.hex_color,
              currency: 'EUR'
            },
            facebook_login: {
              allowed: true,
              enabled: true,
              app_id: '307796929633098',
              app_secret: '28082a4c201d7cee136dbe35236e44cb'
            },
            groups: {
              enabled: true,
              allowed:true
            },
            private_projects: {
              enabled: true,
              allowed: true
            }
          }
         })
        Apartment::Tenant.switch("#{name}_localhost") do
          service.resolve_and_apply_template template, external_subfolder: 'test'
        end
      end
    end

    it "raises an error if the requested template was not found"  do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist', external_subfolder: false)}.to raise_error
    end

    it "raises an error if the requested template was not found", template_test: true  do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist', external_subfolder: 'test')}.to raise_error
    end
  end

  describe "resolve_and_apply_template", slow_test: true do
    
    TenantTemplateService.new.available_templates[:internal].map do |template|
      it "Successfully applies '#{template}' template" do 
        name = template.split('_').join('')
        locales = TenantTemplateService.new.required_locales(template, external_subfolder: 'test')
        locales = ['en'] if locales.blank?
        Tenant.create!({
          name: name,
          host: "#{name}.localhost",
          logo: Rails.root.join("spec/fixtures/logo.png").open,
          header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
          settings: {
            core: {
              allowed: true,
              enabled: true,
              locales: locales,
              organization_type: 'medium_city',
              organization_name: locales.map { |locale|
                [locale,Faker::Address.city]
              }.to_h,
              timezone: "Europe/Brussels",
              color_main: Faker::Color.hex_color,
              color_secondary: Faker::Color.hex_color,
              color_text: Faker::Color.hex_color,
              currency: 'EUR'
            },
            facebook_login: {
              allowed: true,
              enabled: true,
              app_id: '307796929633098',
              app_secret: '28082a4c201d7cee136dbe35236e44cb'
            },
            groups: {
              enabled: true,
              allowed:true
            },
            private_projects: {
              enabled: true,
              allowed: true
            }
          }
         })
        Apartment::Tenant.switch("#{name}_localhost") do
          service.resolve_and_apply_template template
        end
      end
    end

    it "raises an error if the requested template was not found" do
      expect{service.resolve_and_apply_template('a_tenant_template_name_that_doesnt_exist')}.to raise_error
    end
  end

  describe "tenant_to_template", slow_test: true do
    it "Successfully generates a tenant template from a given tenant" do
      load Rails.root.join("db","seeds.rb")
      localhost = Tenant.find_by(host: 'localhost')
      settings = localhost.settings
      settings['core']['locales'] = Tenant.current.settings.dig('core', 'locales')
      localhost.update! settings: settings
      Apartment::Tenant.switch('localhost') do
        load Rails.root.join("db","seeds.rb")
      end
      TenantService.new.clear_images_and_files!(Tenant.find_by(host: 'localhost'))
      template = service.tenant_to_template Tenant.find_by(host: 'localhost')
      service.apply_template template

      Apartment::Tenant.switch('localhost') do
        expect(Area.count).to be > 0
        expect(AreasIdea.count).to be > 0
        expect(Comment.count).to be > 0
        expect(CustomFieldOption.count).to be > 0
        expect(Event.count).to be > 0
        expect(IdeaStatus.count).to be > 0
        expect(User.admin.count).to be > 0
        expect(Vote.count).to be > 0
      end
    end
  end

end
