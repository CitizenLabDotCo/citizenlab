# require 'rails_helper'
#
# RSpec.describe "Idea API", type: :request do
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
#
#   context "get" do
#     it 'returns a record by id' do
#       idea = create_idea
#       get endpoint_url_with_id(idea.id)
#
#       assert_status(200)
#       # assert returned data
#       expect(json_response[:data][:id]).to_not be_nil
#     end
#
#     it "returns 404 response if record not found" do
#       get endpoint_url_with_id(123)
#
#       assert_status(404)
#     end
#   end
#
#   context "insert" do
#     xit "returns 201 response if successful" do
#       # set params for the create request
#       idea_params = FactoryBot.build(:idea).attributes.symbolize_keys
#       idea_params.delete(:id)
#       idea_params[:title_multiloc] = { en: 'My idea' }
#       idea_params[:body_multiloc] = { en: 'idea body' }
#
#       post endpoint_url, params: { idea: idea_params }
#
#       assert_status(201)
#       expect(json_response[:data][:id]).to_not be_nil
#     end
#
#     xit "returns 400 response if failed to create" do
#       # set some invalid data for the request
#       idea_params = {title_multiloc: ''}
#       post endpoint_url, params: { idea: idea_params }
#
#       expect(json_response).to_not be_empty
#       assert_status(400)
#     end
#   end
#
#   context "patch" do
#     xit "returns 200 response if successful"  do
#       idea = create_idea
#       # set params for the update request
#       idea_params = {title_multiloc: { en: 'My idea updated' }}
#       patch endpoint_url_with_id(idea.id), params: { idea: idea_params }
#
#       assert_status(200)
#       # assert updated data
#       expect(idea.reload.title_multiloc).to eq({ "en" => "My idea updated" })
#     end
#
#     xit "returns 400 response if failed to update" do
#       idea = create_idea
#       # set some invalid data for the request
#       idea_params = {title_multiloc: { de: 'hello' }}
#       patch endpoint_url_with_id(idea.id), params: { idea: idea_params }
#
#       assert_status(400)
#     end
#
#     it "returns 404 response if record not found" do
#       patch endpoint_url_with_id(123), params: { idea: {} }
#       assert_status(404)
#     end
#   end
#
#   context "delete" do
#     xit "returns 204 response if successful"  do
#       idea = create_idea
#       delete endpoint_url_with_id(idea.id)
#
#       assert_status(204)
#       all_ideas = Idea.all
#       expect(all_ideas.count).to eq(0)
#     end
#
#     it "returns 404 response if record not found" do
#       delete endpoint_url_with_id(123)
#       assert_status(404)
#     end
#   end
#
#   private
#   def create_idea
#     FactoryBot.create(:idea, title_multiloc: { en: 'My idea' })
#   end
# end
