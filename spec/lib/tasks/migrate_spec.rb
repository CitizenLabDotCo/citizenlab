require 'rails_helper'

require 'rake'
require 'rake/testtask'


RSpec.describe "Rake Migrate" do
  context "from_cl1 task" do
    it "can be invoked" do
      Rails.application.load_tasks
      Rake.application.rake_require '../../lib/tasks/migrate'
      results = Rake.application['migrate:from_cl1'].invoke
    end
  end
end