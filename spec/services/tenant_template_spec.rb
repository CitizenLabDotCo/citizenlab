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

  describe "apply_template" do

    it "Successfully applies all templates (residing in config/tenant_templates)" do  
      service.available_templates.map do |template|
        service.apply_template template
      end
    end

    it "Successfully applies the base template" do # deze wel uitwerken omdat deze omzetting test
      tenant = service.apply_template('spec/services/tenant_template.yml', is_path=true)
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 12
      expect(User.count).to be 2
      lea = User.find_by(email: 'princesslea@gmail.com')
      expect(lea).to be_present
      expect(lea.last_name).to eq('Skywalker')

      expect(Project.count).to be 1
    end
  end

end
