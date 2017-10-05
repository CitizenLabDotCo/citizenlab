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

    it "Successfully applies the base template" do  
      tenant = service.apply_template('base') # doen voor elke yml in deze dir
      ### Overbodig
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 12
      expect(Page.count).to be 3
      ###
    end

    it "Successfully applies the base template" do # deze wel uitwerken omdat deze omzetting test
      tenant = service.apply_template('spec/services/tenant_template.yml', is_path=true)
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 12
      expect(Project.count).to be 1
    end
  end

end
