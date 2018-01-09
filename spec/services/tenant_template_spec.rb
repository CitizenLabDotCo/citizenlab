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

  describe "apply_template", slow_test: true do
    it "Successfully applies all templates (residing in config/tenant_templates)" do 
      service.available_templates.map do |template|
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
              locales: ['en','nl','fr','de'],
              organization_type: 'medium_city',
              organization_name: {
                "en" => Faker::Address.city,
                "nl" => Faker::Address.city,
                "fr" => Faker::Address.city,
                "de" => Faker::Address.city
              },
              timezone: "Europe/Brussels",
              color_main: Faker::Color.hex_color,
            },
            demographic_fields: {
              allowed: true,
              enabled: true,
              gender: true,
              domicile: true,
              birthyear: true,
              education: true,
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
          service.apply_template template
        end
      end
    end

    it "Successfully generates and applies tenant templates (those acquired from spreadsheets)" do
      tenant = service.apply_template('spec/services/tenant_template.yml', is_path=true)
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 14
      expect(User.count).to be 2
      lea = User.find_by(email: 'princesslea@gmail.com')
      expect(lea).to be_present
      expect(lea.last_name).to eq('Skywalker')
      expect(lea.avatar).to be_present
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

    it "Applies the base template if the requested template was not found" do
      tenant = service.apply_template('a_tenant_template_name_that_doesnt_exist')
      expect(IdeaStatus.count).to be > 0
      expect(Topic.count).to be > 0
      expect(Page.count).to be > 0
    end
  end

end
