require 'rails_helper'

require 'rake'

## Doesn't do anything, ideally we would like to stub a CL1 mongo db with minimal amount of data


RSpec.describe "Rake Migrate" do
  context "from_cl1 task" do
    it "can be invoked" do
      Rails.application.load_tasks
      # results = Rake.application['migrate:from_cl1'].invoke
    end
  end
end