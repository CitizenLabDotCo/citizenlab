require "rails_helper"

describe TenantTemplateService do
  let(:service) { TenantTemplateService.new }

  before do
  end

  describe "available_templates" do

    it "returns a non-empty list" do
      expect(service.available_templates).to_not be_empty
    end

  end

  describe "resolve_and_apply_template", slow_test: true do
    
    TenantTemplateService.new.available_templates.map do |template|
      it "Successfully applies '#{template}' template" do 
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
              locales: CL2_SUPPORTED_LOCALES,
              organization_type: 'medium_city',
              organization_name: CL2_SUPPORTED_LOCALES.map { |locale|
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

    it "Successfully generates and applies tenant templates (those acquired from spreadsheets)" do
      tenant = service.resolve_and_apply_template('spec/services/tenant_template.yml', is_path=true)
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 14
      expect(User.count).to be 2
      lea = User.find_by(email: 'princesslea@gmail.com')
      expect(lea).to be_present
      expect(lea.last_name).to eq('Skywalker')
      expect(Comment.count).to be 3
      cs = Comment.all.select { |c| c.body_multiloc['en'].include? 'never seen you riding a bicycle' }
      expect(cs.size).to be 1
      c2 = cs.first
      c1 = c2.parent
      expect(c2.idea.id).to eq(c1.idea.id)
      expect(Project.count).to be 1
      expect(Project.all.first.project_images.size).to be 1
      expect(Event.count).to be 1
      expect(Phase.count).to be 3
    end

    it "raises an error if the requested template was not found" do
      expect{service.load_and_apply_template('a_tenant_template_name_that_doesnt_exist')}.to raise_error
    end
  end

  describe "tenant_to_template", slow_test: true do
    it "Successfully generates a tenant template from a given tenant" do
      load Rails.root.join("db","seeds.rb")
      template = YAML.load(service.tenant_to_template Tenant.find_by(host: 'localhost'))

      # docker-compose run --rm web rspec ./spec/services/tenant_template_spec.rb -e tenant_to_template
      # byebug
      service.apply_template template
    end
  end

end
