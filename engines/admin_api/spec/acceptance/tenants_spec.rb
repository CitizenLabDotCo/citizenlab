require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Tenants" do

  explanation "Tenants represent the different platforms (typically one for each city)."

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

end