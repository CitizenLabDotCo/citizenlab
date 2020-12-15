require 'rails_helper'

RSpec.describe "Graphql folder" do
  let(:context) { {} }
  let(:result) {
    AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
  }

  describe "folder" do
    let(:query_string) { %|
      query projectFolderQuery($id: ID!) {
        projectFolder(id: $id) {
          id
          slug
          publicationStatus
        }
      }
    |}


    let(:folder) { create(:project_folder) }
    let(:variables) { {id: folder.id }}

    it "returns all folders" do
      response = result
      expect(response.dig("data", "projectFolder")).to match ({
        "id" => folder.id,
        "slug" => folder.slug,
        "publicationStatus" => folder.admin_publication.publication_status
      })
    end

  end
end
