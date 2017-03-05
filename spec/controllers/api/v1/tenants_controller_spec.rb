require 'rails_helper'

RSpec.describe Api::V1::TenantsController, type: :controller do

  describe "GET #current" do
    it "returns http success" do
      get :current
      expect(response).to have_http_status(:success)
    end
  end

end
