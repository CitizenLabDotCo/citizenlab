# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Volunteering Volunteers' do
  explanation 'Volunteers are linking causes and users, indicating the user volunteers for the cause'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
  end

  context 'when normal user' do
    post 'web_api/v1/causes/:cause_id/volunteers' do
      ValidationErrorHelper.new.error_fields(self, Volunteering::Volunteer)

      let(:cause) { create(:cause) }
      let(:cause_id) { cause.id }

      example_request 'Create a volunteer with the current user' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :relationships, :cause, :data, :id)).to eq cause.id
      end

      example '[error] Create a volunteer with the current user again' do
        create(:volunteer, user: @user, cause: cause)
        do_request
        assert_status 422
      end
    end

    delete 'web_api/v1/causes/:cause_id/volunteers' do
      let(:cause) { create(:cause) }
      let(:cause_id) { cause.id }
      let!(:volunteer) { create(:volunteer, user: @user, cause: cause) }

      example 'Delete the volunteering of the current user' do
        old_count = Volunteering::Volunteer.count
        do_request
        assert_status 200
        expect { volunteer.reload }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Volunteering::Volunteer.count).to eq(old_count - 1)
      end
    end
  end

  context 'when admin' do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get 'web_api/v1/causes/:cause_id/volunteers' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of volunteers per page'
      end

      before do
        @cause = create(:cause)
        @volunteers = create_list(:volunteer, 3, cause: @cause)
        create(:volunteer)
      end

      let(:cause_id) { @cause.id }

      example_request 'List all volunteers for a cause as an admin' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d[:relationships][:user][:data][:id] }).to match_array @volunteers.map(&:user_id)
        expect(json_response[:included].pluck(:id)).to match_array @volunteers.map(&:user_id)
      end
    end

    get 'web_api/v1/projects/:participation_context_id/volunteers/as_xlsx' do
      before do
        @project = create(:continuous_volunteering_project)
        @cause1 = create(:cause, title_multiloc: { en: 'For sure works with very long titles too!!!' }, participation_context: @project)
        @volunteers1 = create_list(:volunteer, 3, cause: @cause1)
        @cause2 = create(:cause, participation_context: @project)
        @volunteers2 = create_list(:volunteer, 3, cause: @cause2)
        create(:cause)
        create(:volunteer)
      end

      let(:participation_context_id) { @project.id }

      example_request 'XLSX export all volunteers of a project' do
        assert_status 200
        worksheets = RubyXL::Parser.parse_buffer(response_body).worksheets
        expect(worksheets.size).to eq 2
        # sheet names can only be 31 characters long
        expect(worksheets[0].sheet_name).to eq '1 - For sure works with very lo'
        expect(worksheets[1].sheet_name).to eq "2 - #{@cause2.title_multiloc['en']}"

        expect(worksheets[0].count).to eq 4
        expect(worksheets[0][1][0].value).to eq @volunteers1[0].user.first_name
        expect(worksheets[0][1][1].value).to eq @volunteers1[0].user.last_name
        expect(worksheets[0][1][2].value).to eq @volunteers1[0].user.email
        expect(worksheets[0][1][3].value.to_i).to eq @volunteers1[0].created_at.to_i
      end

      describe do
        before do
          @user = create(:user)
          token = Knock::AuthToken.new(payload: @user.to_token_payload).token
          header 'Authorization', "Bearer #{token}"
        end

        example '[error] XLSX export by a normal user', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end
end
