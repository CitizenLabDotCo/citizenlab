require 'rails_helper'

require 'rake'
# require 'rake/rdoctask'
require 'rake/testtask'
# require 'tasks/rails'


RSpec.describe "Rake Migrate" do
  context "from_cl1 task" do
    it "can be invoked" do
      Rails.application.load_tasks
      Rake.application.rake_require '../../lib/tasks/migrate'
      results = Rake.application['migrate:from_cl1'].invoke
      byebug
    end
  end
end
#   before :each do
#     host! "example.org"
#   end
#
#   def endpoint_url
#     "/api/v1/ideas"
#   end
#
#   def endpoint_url_with_id(id)
#     "/api/v1/ideas/#{id}"
#   end
#
#   def json_response
#     json_parse(response.body) if response.body
#   end
#
#   context "list" do
#     it 'returns the list of all records' do
#       create_idea
#       get endpoint_url
#
#       assert_status(200)
#       assert_count(json_response, 1)
#       expect(json_response[:data].first[:attributes][:"title_multiloc"]).to eq({ en: 'My idea' })
#     end
#
#     it "returns an empty array if no records are found" do
#       get endpoint_url
#
#       expect(response.status).to eq(200)
#       expect(json_response[:data]).to eq([])
#     end
#   end