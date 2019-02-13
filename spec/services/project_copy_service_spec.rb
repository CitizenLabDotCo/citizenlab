require "rails_helper"

describe ProjectCopyService do
  let(:service) { ProjectCopyService.new }

  describe "project copy", slow_test: true do

    it "works" do
      load Rails.root.join("db","seeds.rb")
      template = Apartment::Tenant.switch('localhost') do
        load Rails.root.join("db","seeds.rb")
        project = Project.all.shuffle.first
        service.export project
      end
      service.import template
      expect(Project.count).to eq 1
    end

  end

end
