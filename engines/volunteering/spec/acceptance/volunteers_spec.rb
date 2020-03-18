
require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Volunteering Volunteers" do
 
  explanation "Volunteers are linking causes and users, indicating the user volunteers for the cause"

  before do
    header "Content-Type", "application/json"
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  context "when normal user" do
    post "web_api/v1/causes/:cause_id/volunteer" do

      ValidationErrorHelper.new.error_fields(self, Volunteering::Volunteer)

      let(:cause) { build(:cause) }
      let(:cause_id) { cause.id }

      example_request "Create a volunteer with the current user" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:user,:data,:id)).to eq @user.id
        expect(json_response.dig(:data,:relationships,:cause,:data,:id)).to eq cause.id
      end

      example "[error] Create a volunteer with the current user again" do
        create(:volunteer, user: @user, cause: cause)
        do_request
        expect(response_status).to eq 422
      end
    end

    delete "web_api/v1/causes/:cause_id/volunteer" do

      let(:cause) { create(:cause) }
      let(:cause_id) { cause.id }
      let(:volunteer) { create(:volunteer, user: @user, cause: cause)}

      example "Delete the volunteering of the current user" do
        old_count = Volunteering::Volunteer.count
        do_request
        expect(response_status).to eq 200
        expect{volunteer.reload}.to raise_error(ActiveRecord::RecordNotFound)
        expect(Volunteering::Volunteer.count).to eq (old_count - 1)
      end
    end
  end


  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/causes/:cause_id/volunteers" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of volunteers per page"
      end

      before do
        @cause = create(:cause)
        @volunteers = create_list(:volunteer, 3, cause: @cause)
        other_volunteer = create(:volunteer)
      end

      let (:cause_id) { @cause.id }

      example_request "List all volunteers for a cause as an admin" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response.dig(:data).map{|d| d[:relationships][:user][:data][:id]}).to match_array @volunteers.map(&:user_id)
        expect(json_response.dig(:included).map{|i| i[:id]}).to match_array @volunteers.map(&:user_id)
      end
    end

  end
end
