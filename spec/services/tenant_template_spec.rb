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

    it "Successfully generates and applies tenant templates (those acquired from spreadsheets)" do
      tenant = service.apply_template('spec/services/tenant_template.yml', is_path=true)
      expect(IdeaStatus.count).to be 5
      expect(Topic.count).to be 12
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
  end

end
