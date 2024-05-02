# frozen_string_literal: true

require 'rails_helper'

resource 'Creating users for a project import' do
  before do
    header 'Content-Type', 'application/json'
  end

  let(:project) { create(:single_phase_ideation_project) }

  post 'web_api/v1/phases/:phase_id/importer/create_user' do
    parameter :project_id, 'ID of the project.', required: true
    with_options scope: 'user' do
      parameter :first_name, 'User first name', required: false
      parameter :last_name, 'User last name', required: false
      parameter :email, 'E-mail address', required: false
      parameter :locale, 'Locale. Should be one of the tenants locales', required: true
    end

    let(:phase_id) { project.phases.first.id }
    let(:first_name) { Faker::Name.first_name }
    let(:last_name) { Faker::Name.last_name }
    let(:locale) { 'en' }

    context 'as an admin' do
      before { admin_header_token }

      context 'with an email' do
        let(:email) { Faker::Internet.email }

        example_request 'Creates a user with an email address' do
          assert_status 201
          expect(User.count).to eq 2
          expect(response_data[:type]).to eq 'user'
          expect(response_data[:attributes][:first_name]).to eq first_name
          expect(response_data[:attributes][:last_name]).to eq last_name
          expect(response_data[:attributes][:email]).to eq email
        end
      end

      context 'without an email' do
        example_request 'Creates a user without an email address' do
          assert_status 201
          expect(User.count).to eq 2
          expect(response_data[:type]).to eq 'user'
          expect(response_data[:attributes][:first_name]).to eq first_name
          expect(response_data[:attributes][:last_name]).to eq last_name
          expect(response_data[:attributes][:email]).to be_nil
          expect(User.order(:created_at).last.unique_code).not_to be_nil
        end
      end
    end

    context 'as a moderator of a project' do
      before { header_token_for create(:project_moderator, projects: [project]) }

      example_request 'Creates a user' do
        assert_status 201
      end
    end

    context 'as a moderator that cannot moderate this project' do
      before { header_token_for create(:project_moderator, projects: [create(:project)]) }

      example_request 'Returns unauthorised' do
        assert_status 401
      end
    end

    context 'as a normal user' do
      example_request 'Returns unauthorised' do
        do_request
        assert_status 401
      end
    end
  end
end
