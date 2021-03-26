require 'rails_helper'

describe WebApi::V1::UserSerializer do

  context "with 'abbreviated user names' enabled" do

    before do
      AppConfiguration.instance.turn_on_abbreviated_user_names!
    end

    let(:jane) { create(:user, first_name: "Jane", last_name: "Doe")}
    let(:john) { create(:user, first_name: "John", last_name: "Smith")}
    let(:admin) { create(:admin, first_name: "Thomas", last_name: "Anderson")}

    it "should abbreviate the user name" do
      last_name = WebApi::V1::UserSerializer
                      .new(jane, params: {current_user: john})
                      .serializable_hash
                      .dig(:data, :attributes, :last_name)
      expect(last_name).to eq "D."
    end

    it "should not abbreviate user names for admins" do
      last_name = WebApi::V1::UserSerializer
                      .new(jane, params: {current_user: admin})
                      .serializable_hash
                      .dig(:data, :attributes, :last_name)
      expect(last_name).to eq "Doe"

      last_name = WebApi::V1::UserSerializer
                      .new(admin, params: {current_user: jane})
                      .serializable_hash
                      .dig(:data, :attributes, :last_name)
      expect(last_name).to eq "Anderson"
    end

  end
end