RSpec.describe "Graphql user" do
  let(:context) { {} }
  let(:result) {
    AdminApi::Schema.execute(
      query_string,
      context: context,
      variables: variables
    )
  }
  let(:query_string) { %|
    query userQuery($id: ID!) {
      user(id: $id) {
        unsubscriptionToken
      }
    }
  |}
  let(:user) { create(:user) }
  let!(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: user) }
  let(:variables) { {id: user.id }}

  it "returns an unsubscriptionToken" do
    response = result
    expect(response.dig("data", "user")).to match ({
      "unsubscriptionToken" => unsubscription_token.token
    })
  end

end