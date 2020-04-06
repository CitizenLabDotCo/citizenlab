require 'rails_helper'

RSpec.describe "Graphql user" do
  let(:context) { {} }
  let(:result) {
    AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
  }

  describe "user" do
    let(:query_string) { %|
      query userQuery($id: ID!) {
        user(id: $id) {
          id
          firstName
          lastName
          email
          slug
          locale
        }
      }
    |}


    let(:user) { create(:user) }
    let(:variables) { {id: user.id }}

    it "returns all users" do
      response = result
      expect(response.dig("data", "user")).to match ({
        "id" => user.id,
        "firstName" => user.first_name,
        "lastName" => user.last_name,
        "email" => user.email,
        "slug" => user.slug,
        "locale" => user.locale
      })
    end

  end
end