# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Volunteering Volunteers' do
  explanation 'Volunteers are linking causes and users, indicating the user volunteers for the cause'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  context 'when normal user' do
    post 'web_api/v1/causes/:cause_id/volunteers' do
      ValidationErrorHelper.new.error_fields(self, Volunteering::Volunteer)

      let(:cause) do
        create(
          :cause,
          phase: create(
            :volunteering_phase,
            start_at: 6.months.ago,
            end_at: nil
          )
        )
      end

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

      context 'when the phase has granular permissions' do
        let(:group) { create(:group) }

        let(:project) do
          create(
            :single_phase_volunteering_project,
            phase_attrs: { with_permissions: true }
          )
        end

        let(:cause) do
          cause = create(:cause, phase: project.phases.first)
          permission = cause.phase.permissions.find_by(action: 'volunteering')
          permission.update!(permitted_by: 'users', groups: [group])

          cause
        end

        let(:cause_id) { cause.id }

        example 'Try to volunteer for a cause, not as a group member', document: false do
          do_request
          assert_status 401
        end

        example 'Try to volunteer for a cause, as a group member', document: false do
          group.add_member(@user).save!
          do_request
          assert_status 201
        end
      end
    end

    delete 'web_api/v1/causes/:cause_id/volunteers' do
      let(:cause) do
        create(
          :cause,
          phase: create(
            :volunteering_phase,
            start_at: 6.months.ago,
            end_at: nil
          )
        )
      end

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
      admin_header_token
      @cause = create(:cause)
      @volunteers = create_list(:volunteer, 3, cause: @cause)
      create(:volunteer)
      @phase = create(:volunteering_phase)
      @cause1 = create(:cause, title_multiloc: { en: 'For sure works with very long titles too!!!' }, phase: @phase)
      create(:custom_field_domicile)
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      user = create(:user, custom_field_values: { 'domicile' => area.id })
      @volunteer1 = create(:volunteer, cause: @cause1, user: user)
      @other_volunteers = create_list(:volunteer, 2, cause: @cause1)
      @cause2 = create(:cause, phase: @phase)
      @volunteers2 = create_list(:volunteer, 3, cause: @cause2)
      create(:cause)
      create(:volunteer)
    end

    get 'web_api/v1/causes/:cause_id/volunteers' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of volunteers per page'
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

    get 'web_api/v1/phases/:phase_id/volunteers/as_xlsx' do
      let(:phase_id) { @phase.id }

      example_request 'XLSX export all volunteers of a project' do
        assert_status 200
        worksheets = RubyXL::Parser.parse_buffer(response_body).worksheets
        expect(worksheets.size).to eq 2
        # sheet names can only be 31 characters long
        expect(worksheets[0].sheet_name).to eq 'For sure works with very long t'
        expect(worksheets[1].sheet_name).to eq @cause2.title_multiloc['en']

        expect(worksheets[0].count).to eq 4
        expect(worksheets[0][1][0].value).to eq @volunteer1.user.first_name
        expect(worksheets[0][1][1].value).to eq @volunteer1.user.last_name
        expect(worksheets[0][1][2].value).to eq @volunteer1.user.email
        expect(worksheets[0][1][3].value.to_i).to eq @volunteer1.created_at.to_i
        expect(worksheets[0][1][4].value).to eq 'Center'
      end

      describe 'when resident' do
        before { resident_header_token }

        example '[error] XLSX export', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end
end
