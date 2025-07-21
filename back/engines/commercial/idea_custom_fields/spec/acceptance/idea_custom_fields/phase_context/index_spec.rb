# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  shared_examples 'Unauthorized (401)' do
    example 'Unauthorized (401)', document: false do
      do_request
      expect(status).to eq 401
    end
  end

  shared_examples 'draft project preview tests' do |options = {}|
    phase_var = options[:phase_var] || 'survey_phase'
    custom_field_var = options[:custom_field_var] || 'custom_field1'

    before do
      phase = instance_eval(phase_var)
      phase.project.update!(admin_publication_attributes: { publication_status: 'draft' })
    end

    context 'and the project_preview_link feature flag is enabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['project_preview_link'] = { 'enabled' => true, 'allowed' => true }
        AppConfiguration.instance.update!(settings: settings)
      end

      context 'and a valid preview_token is provided in cookies' do
        before do
          phase = instance_eval(phase_var)
          header('Cookie', "preview_token=#{phase.project.preview_token}")
        end

        example 'List all public custom fields for a phase' do
          do_request(public_fields: true)
          assert_status 200

          field = instance_eval(custom_field_var)
          expect(response_data.size).to be >= 1
          expect(response_data.map { |d| d.dig(:attributes, :key) }).to include(field.key)
        end
      end

      context 'and an invalid preview_token is provided in cookies' do
        before { header('Cookie', 'preview_token=invalid') }

        include_examples 'Unauthorized (401)'
      end

      context 'and no preview_token is provided in cookies' do
        include_examples 'Unauthorized (401)'
      end
    end

    context 'and the project_preview_link feature flag is disabled and a valid preview_token is provided in cookies' do
      before do
        phase = instance_eval(phase_var)
        header('Cookie', "preview_token=#{phase.project.preview_token}")
      end

      include_examples 'Unauthorized (401)'
    end
  end

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/phases/:phase_id/custom_fields' do
    parameter :support_free_text_value, 'Only return custom fields that have a freely written textual answer', type: :boolean, required: false
    parameter :copy, 'Return non-persisted copies of all custom fields with new IDs', type: :boolean, required: false
    parameter :input_types, 'Filter custom fields by input types', type: :array, items: { type: :string }, required: false
    parameter :public_fields, 'Only return custom fields that are visible to the public', type: :boolean, required: false

    let(:survey_phase) { create(:native_survey_phase) }
    let(:phase_id) { survey_phase.id }
    let(:form) { create(:custom_form, participation_context: survey_phase) }
    let!(:custom_field1) { create(:custom_field_text, resource: form, key: 'extra_field1') }
    let!(:custom_field2) { create(:custom_field_number, resource: form, key: 'extra_field2', enabled: false) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a phase' do
        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key,
          custom_field2.key
        ]
      end

      example 'List all allowed custom fields for a phase with a textual answer', document: false do
        do_request(support_free_text_value: true)
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key
        ]
      end

      example 'List all custom fields for a phase reset for copying', document: false do
        do_request(copy: true)
        assert_status 200

        expect(response_data.size).to eq 2
        expect(response_data[0][:id]).not_to eq custom_field1.id
        expect(response_data[1][:id]).not_to eq custom_field2.id
      end

      example 'List all relevant custom fields for a phase with a filter on input_types' do
        do_request(input_types: ['number'])
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field2.key
        ]
      end

      example 'List all public custom fields for a phase' do
        do_request(public_fields: true)
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key
        ]
      end
    end

    context 'when regular user' do
      let(:user) { create(:user) }

      before { header_token_for(user) }

      context 'when the project is in draft' do
        include_examples 'draft project preview tests', {
          phase_var: 'survey_phase',
          custom_field_var: 'custom_field1'
        }
      end
    end

    context 'when a visitor' do
      context 'when the project is in draft' do
        include_examples 'draft project preview tests', {
          phase_var: 'survey_phase',
          custom_field_var: 'custom_field1'
        }
      end
    end
  end

  context 'When there are 2 survey phases in same project' do
    get 'web_api/v1/phases/:phase_id/custom_fields' do
      let(:phase_id) { current_phase.id }

      let(:project) { create(:project) }

      let(:past_phase) { create(:native_survey_phase, start_at: 2.weeks.ago, end_at: 1.week.ago, project: project) }
      let(:form) { create(:custom_form, participation_context: past_phase) }
      let!(:custom_field1) { create(:custom_field_text, resource: form, key: 'survey1_field') }

      let(:current_phase) { create(:native_survey_phase, start_at: 1.day.ago, end_at: 1.week.from_now, project: project) }

      context 'when survey form not persisted' do
        shared_examples 'returns default survey custom fields' do
          example_request 'List default survey custom fields' do
            assert_status 200
            expect(response_data.size).to eq 3

            keys = response_data.map { |d| d.dig(:attributes, :key) }

            expect(keys).to include('page1', 'form_end')
            expect(keys.any? { |key| key.include?('default_question') }).to be true
          end
        end

        context 'when admin' do
          before { admin_header_token }

          include_examples 'returns default survey custom fields'

          example 'List survey fields in project for groups not including user' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 200
            expect(response_data.size).to eq 3
          end
        end

        context 'when regular user' do
          before { header_token_for(user) }

          let(:user) { create(:user) }

          include_examples 'returns default survey custom fields'

          example '[Unauthorized] List survey fields in admin only project' do
            project.update!(visible_to: 'admins')
            do_request
            assert_status 401
          end

          example '[Unauthorized] List survey fields in project for groups not including user' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 401
          end

          example 'List survey fields in project for groups including user' do
            project.update!(visible_to: 'groups')
            group = create(:group)
            create(:membership, group: group, user: user)
            create(:groups_project, group: group, project: project)
            do_request
            assert_status 200
            expect(response_data.size).to eq 3
          end
        end

        context 'when visitor' do
          include_examples 'returns default survey custom fields'

          example '[Unauthorized] List survey fields in admin only project' do
            project.update!(visible_to: 'admins')
            do_request
            assert_status 401
          end

          example '[Unauthorized] List survey fields in project for groups' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 401
          end
        end
      end

      context 'when survey form persisted' do
        let(:form2) { create(:custom_form, participation_context: current_phase) }
        let!(:custom_field2) { create(:custom_field_text, resource: form2, key: 'survey2_field') }

        shared_examples 'returns non-default survey custom fields' do
          example_request 'List all custom fields for a survey' do
            assert_status 200
            expect(response_data.size).to eq 1
            expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
              custom_field2.key
            ]
          end
        end

        context 'when admin' do
          before { admin_header_token }

          include_examples 'returns non-default survey custom fields'

          example 'List survey fields in project for groups not including user' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 200
            expect(response_data.size).to eq 1
          end
        end

        context 'when regular user' do
          let(:user) { create(:user) }

          before { header_token_for(user) }

          include_examples 'returns non-default survey custom fields'

          example '[Unauthorized] List survey fields in admin only project' do
            project.update!(visible_to: 'admins')
            do_request
            assert_status 401
          end

          example '[Unauthorized] List survey fields in project for groups not including user' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 401
          end

          example 'List survey fields in project for groups including user' do
            project.update!(visible_to: 'groups')
            group = create(:group)
            create(:membership, group: group, user: user)
            create(:groups_project, group: group, project: project)
            do_request
            assert_status 200
            expect(response_data.size).to eq 1
          end
        end

        context 'when visitor' do
          include_examples 'returns non-default survey custom fields'

          example '[Unauthorized] List survey fields in admin only project' do
            project.update!(visible_to: 'admins')
            do_request
            assert_status 401
          end

          example '[Unauthorized] List survey fields in project for groups' do
            project.update!(visible_to: 'groups')
            do_request
            assert_status 401
          end
        end
      end
    end
  end
end
