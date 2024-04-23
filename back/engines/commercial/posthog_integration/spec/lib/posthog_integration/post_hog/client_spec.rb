require 'rails_helper'

# TODO
# Spec exact request matches + headers
# Spec throttling and retry
# Refactoring
# Add retry for persons + wait less long + reusable method

describe PosthogIntegration::PostHog::Client do

  let(:base_uri) { 'https://example.com' }
  let(:api_key) { 'fake_api_key' }
  let(:project_id) { 'fake_project_id' }
  let(:posthog) { described_class.new(base_uri: base_uri, api_key: api_key).tap { |client| client.default_project_id = project_id } }

  describe 'delete_person_by_distinct_id' do
    it 'sends a delete request' do
      user = create(:user)

      # TODO fixture json file
      persons_response = <<~JSON_RESPONSE
        {
          "next": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "previous": "https://app.posthog.com/api/projects/{project_id}/accounts/?offset=400&limit=100",
          "count": 400,
          "results": [
            {
              "id": 0,
              "name": "string",
              "distinct_ids": [
                "string"
              ],
              "properties": null,
              "created_at": "2019-08-24T14:15:22Z",
              "uuid": "095be615-a8ad-4c33-8e9c-c7612fbf6c9f"
            }
          ]
        }
      JSON_RESPONSE
      stub_request(:get, "https://example.com/api/projects/#{project_id}/persons?distinct_id=#{user.id}")
        .to_return(status: 200, body: persons_response, headers: { 'Content-Type' => 'application/json' })


      stub_request(:delete, "https://example.com/api/projects/#{project_id}/persons/0")
        .to_return(status: 204)
      

      # stub_request(:any, "example.com") ### Does not work
      # stub_request(:get, "https://something.com/api/projects/fake_project_id/persons?distinct_id=\"#{user.id}\"") ### Does not work


      expect { posthog.delete_person_by_distinct_id(user.id) }.not_to raise_error
    end
  end
end
