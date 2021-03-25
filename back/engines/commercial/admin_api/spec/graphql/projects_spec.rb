require 'rails_helper'

RSpec.describe "Graphql project" do
  let(:context) { {} }
  let(:result) {
    AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
  }

  describe "project" do
    let(:query_string) { %|
      query projectQuery($id: ID!) {
        project(id: $id) {
          id
          slug
          publicationStatus
          visibleTo
          processType
        }
      }
    |}


    let(:project) { create(:project) }
    let(:variables) { {id: project.id }}

    it "returns all projects" do
      response = result
      expect(response.dig("data", "project")).to match ({
        "id" => project.id,
        "slug" => project.slug,
        "publicationStatus" => project.admin_publication.publication_status,
        "visibleTo" => project.visible_to,
        "processType" => project.process_type
      })
    end

  end
end