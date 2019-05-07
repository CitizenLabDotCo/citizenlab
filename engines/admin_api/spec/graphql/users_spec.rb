RSpec.describe "Graphql user" do
  let(:context) { {} }
  let(:result) {
    res = AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
    if res["errors"]
      pp res
    end
    res
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
        "slug" => user.slug
      })
    end

  end
end