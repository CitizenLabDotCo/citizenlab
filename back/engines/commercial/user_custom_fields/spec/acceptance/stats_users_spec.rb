# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def time_boundary_parameters(s)
  s.parameter :start_at, 'Date defining from where results should start', required: false
  s.parameter :end_at, 'Date defining till when results should go', required: false
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only return users that are a member of the given group', required: false
end

shared_examples 'xlsx export' do |field_name, request_time|
  example "Users xlsx by #{field_name}" do
    if request_time.present?
      travel_to(request_time) { do_request }
    else
      do_request
    end

    expect(response_status).to eq 200

    worksheet = RubyXL::Parser.parse_buffer(response_body)[0]
    worksheet_values = xlsx_worksheet_to_array(worksheet)

    expect(worksheet.sheet_name).to eq(expected_worksheet_name)
    expect(worksheet_values).to eq(expected_worksheet_values)
  end
end

resource 'Stats - Users' do
  header 'Content-Type', 'application/json'

  let_it_be(:timezone) { AppConfiguration.instance.settings('core', 'timezone') }
  let_it_be(:now) { Time.now.in_time_zone(timezone) }
  let_it_be(:start_at) { (now - 1.year).in_time_zone(timezone).beginning_of_year }
  let_it_be(:end_at) { (now - 1.year).in_time_zone(timezone).end_of_year }

  before_all do
    Tenant.current.update!(created_at: now - 2.years)

    create(:custom_field_birthyear)
    create(:custom_field_gender, :with_options)
    create(:custom_field_domicile)
    create(:custom_field_education, :with_options, enabled: true)

    travel_to(start_at - 1.day) { create(:user) }
    travel_to(end_at + 1.day) { create(:user) }
  end

  before { admin_header_token }

  def create_group(members)
    create(:group).tap do |group|
      members.each { |user| create(:membership, user: user, group: group) }
    end
  end

  def xlsx_worksheet_to_array(worksheet)
    worksheet.map { |row| row.cells.map(&:value) }
  end

  describe 'by_gender endpoints' do
    get 'web_api/v1/stats/users_by_gender' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      before do # rubocop:disable RSpec/ScatteredSetup
        travel_to start_at + 16.days do
          group_members = %w[female female unspecified].map { |gender| create(:user, gender: gender) }
          @group = create_group(group_members)
          _non_member = create(:user)
        end
      end

      let(:group) { @group.id }

      context "when 'gender' custom field has no reference distribution" do
        example_request 'Users by gender' do
          expect(response_status).to eq 200
          expect(json_response_body).to include(
            series: {
              users: { female: 2, unspecified: 1, male: 0, _blank: 0 },
              expected_users: nil,
              reference_population: nil
            }
          )
        end
      end

      context "when 'gender' custom field has a reference distribution" do
        let!(:ref_distribution) do
          create(:categorical_distribution, custom_field: CustomField.find_by(key: 'gender'))
        end

        example_request 'Users by gender with expected user counts' do
          expect(response_status).to eq 200
          expect(json_response_body).to include(
            series: {
              users: { female: 2, unspecified: 1, male: 0, _blank: 0 },
              expected_users: {
                male: kind_of(Numeric),
                female: kind_of(Numeric),
                unspecified: kind_of(Numeric)
              },
              reference_population: ref_distribution.distribution_by_option_key.symbolize_keys
            }
          )
        end
      end
    end

    get 'web_api/v1/stats/users_by_gender_as_xlsx' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      before do # rubocop:disable RSpec/ScatteredSetup
        travel_to start_at + 16.days do
          group_members = %w[female female male unspecified].map { |gender| create(:user, gender: gender) }
          @group = create_group(group_members)
          _non_member = create(:user)
        end
      end

      let(:group) { @group.id }

      include_examples('xlsx export', 'gender') do
        let(:expected_worksheet_name) { 'users_by_gender' }
        let(:expected_worksheet_values) do
          [
            %w[option option_id users],
            ['youth council', 'male', 1],
            ['youth council', 'female', 2],
            ['youth council', 'unspecified', 1],
            ['_blank', '_blank', 0]
          ]
        end
      end
    end
  end

  describe 'by_birthyear endpoints' do
    before do
      travel_to start_at + 16.days do
        group_members = [1980, 1980, 1976].map { |year| create(:user, birthyear: year) }
        @group = create_group(group_members)
        _non_member = create(:user, birthyear: 1980)
      end

      travel_to start_at + 18.days do
        @project = create(:project)
        @idea1 = create(:idea, project: @project)
        create(:published_activity, item: @idea1, user: @idea1.author)
      end
    end

    shared_examples 'ignore reference distribution' do
      example 'is not affected by the presence of a reference distribution', document: false, skip: 'flaky with users_by_birthyear_as_xlsx' do
        do_request
        response_without_reference = response_body

        create(:binned_distribution)
        do_request
        response_with_reference = response_body

        expect(response_status).to eq 200
        expect(response_without_reference).to eq response_with_reference
      end
    end

    get 'web_api/v1/stats/users_by_birthyear' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      describe 'filtered by group' do
        let(:group) { @group.id }

        example_request 'Users by birthyear' do
          expect(response_status).to eq 200
          expect(json_response_body).to match({
            series: {
              users: { '1980': 2, '1976': 1, _blank: 0 },
              expected_users: nil,
              reference_population: nil
            }
          })
        end
      end

      describe 'filtered by project' do
        let(:project) { @project.id }

        example_request 'Users by birthyear filtered by project' do
          expect(response_status).to eq 200
          expect(json_response_body[:series][:users].values.sum).to eq 1
        end
      end

      include_examples 'ignore reference distribution'
    end

    get 'web_api/v1/stats/users_by_birthyear_as_xlsx' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      let(:group) { @group.id }

      include_examples('xlsx export', 'birthyear') do
        let(:expected_worksheet_name) { 'users_by_birthyear' }
        let(:expected_worksheet_values) do
          [
            %w[option users],
            [1976, 1],
            [1980, 2],
            ['_blank', 0]
          ]
        end
      end

      include_examples 'ignore reference distribution'
    end
  end

  describe 'by_domicile endpoints' do
    before do
      travel_to start_at + 16.days do
        @area1, @area2, @area3 = create_list(:area, 3)
        group_members = [@area1, @area1, @area2, nil].map { |area| create(:user, domicile: area&.id) }
        @group = create_group(group_members)
        _non_member = create(:user, birthyear: 1980)
      end
    end

    let(:group) { @group.id }

    get 'web_api/v1/stats/users_by_domicile' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      example_request 'Users by domicile' do
        expect(response_status).to eq 200
        expect(json_response_body).to match({
          areas: Area.all.to_h { |area| [area.id, area.attributes.slice('title_multiloc')] },
          series: {
            users: {
              @area1.id => 2,
              @area2.id => 1,
              @area3.id => 0,
              outside: 0,
              _blank: 1
            }
          }
        }.deep_symbolize_keys)
      end
    end

    get 'web_api/v1/stats/users_by_domicile_as_xlsx' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      include_examples('xlsx export', 'domicile') do
        let(:expected_worksheet_name) { 'users_by_area' }
        let(:expected_worksheet_values) do
          [
            %w[area area_id users],
            ['Westside', Area.ids[0], 2],
            ['Westside', Area.ids[1], 1],
            ['Westside', Area.ids[2], 0],
            ['unknown', '_blank', 1]
          ]
        end
      end
    end
  end

  describe 'by_education endpoints' do
    before do
      travel_to start_at + 24.days do
        group_members = %w[3 3 5].map { |education| create(:user, education: education) }
        @group = create_group(group_members)
        _non_member = create(:user, education: '3')
      end
    end

    let(:group) { @group.id }

    get 'web_api/v1/stats/users_by_education' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      example_request 'Users by education' do
        expect(response_status).to eq 200

        expected_users = CustomField.find_by(key: 'education')
          .options.to_h { |option| [option.key, 0] }
          .merge('3': 2, '5': 1, _blank: 0)
          .symbolize_keys

        expect(json_response_body).to include(
          series: {
            users: expected_users,
            expected_users: nil,
            reference_population: nil
          }
        )
      end
    end

    get 'web_api/v1/stats/users_by_education_as_xlsx' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      include_examples('xlsx export', 'education') do
        let(:expected_worksheet_name) { 'users_by_education' }
        let(:expected_worksheet_values) do
          [
            %w[option option_id users],
            ['youth council', 2, 0],
            ['youth council', 3, 2],
            ['youth council', 4, 0],
            ['youth council', 5, 1],
            ['youth council', 6, 0],
            ['youth council', 7, 0],
            ['youth council', 8, 0],
            ['_blank', '_blank', 0]
          ]
        end
      end
    end
  end

  describe 'by_custom_field endpoints' do
    get 'web_api/v1/stats/users_by_custom_field/:custom_field_id' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      describe 'with select field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_select)
          @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)

          # We create an option on a different custom_field, but with the same
          # key. This covers a regressions that mixed up custom field options
          # between fields
          @custom_field2 = create(:custom_field_select)
          create(:custom_field_option, key: @option1.key, title_multiloc: { en: 'different' }, custom_field: @custom_field2)

          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          end

          travel_to(start_at + 4.days) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => @option2.key }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => @option3.key })
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        context 'when the custom field has no reference distribution' do
          example_request 'Users by custom field (select)' do
            expect(response_status).to eq 200
            expect(json_response_body).to match({
              options: {
                @option1.key => { title_multiloc: @option1.title_multiloc, ordering: 0 },
                @option2.key => { title_multiloc: @option2.title_multiloc, ordering: 1 },
                @option3.key => { title_multiloc: @option3.title_multiloc, ordering: 2 }
              },
              series: {
                users: {
                  @option1.key => 1,
                  @option2.key => 1,
                  @option3.key => 0,
                  _blank: 1
                },
                expected_users: nil,
                reference_population: nil
              }
            }.deep_symbolize_keys)
          end
        end

        context 'when the custom field has a reference distribution' do
          before { create(:categorical_distribution, custom_field: @custom_field) }

          example_request 'Users by custom field (select) including expected nb of users' do
            expect(response_status).to eq 200
            expect(json_response_body).to include(series: hash_including(
              expected_users: @custom_field.options.to_h { |option| [option.key.to_sym, kind_of(Numeric)] }
            ))
          end
        end
      end

      describe 'with multiselect field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_multiselect)
          @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)
          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
          end

          travel_to(start_at + 6.days) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => [@option1.key, @option2.key] }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => [@option3.key] })
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        example_request 'Users by custom field (multiselect)' do
          expect(response_status).to eq 200
          expect(json_response_body).to match({
            options: {
              @option1.key => { title_multiloc: @option1.title_multiloc, ordering: 0 },
              @option2.key => { title_multiloc: @option2.title_multiloc, ordering: 1 },
              @option3.key => { title_multiloc: @option3.title_multiloc, ordering: 2 }
            },
            series: {
              users: {
                @option1.key => 2,
                @option2.key => 1,
                @option3.key => 0,
                _blank: 1
              },
              expected_users: nil,
              reference_population: nil
            }
          }.deep_symbolize_keys)
        end
      end

      describe 'with checkbox field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_checkbox)
          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
          end

          travel_to(start_at + 24.days) do
            create(:user, custom_field_values: { @custom_field.key => true }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => true }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        example_request 'Users by custom field (checkbox)' do
          expect(response_status).to eq 200
          expect(json_response_body).to match({
            series: {
              users: {
                # rubocop:disable Lint/BooleanSymbol
                true: 1,
                false: 1,
                # rubocop:enable Lint/BooleanSymbol
                _blank: 1
              },
              expected_users: nil,
              reference_population: nil
            }
          })
        end
      end
    end

    get 'web_api/v1/stats/users_by_custom_field_as_xlsx/:custom_field_id' do
      time_boundary_parameters self
      group_filter_parameter self

      describe 'with select field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_select, key: 'select_field')
          @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)

          # We create an option on a different custom_field, but with the same
          # key. This covers a regressions that mixed up custom field options
          # between fields
          @custom_field2 = create(:custom_field_select)
          create(:custom_field_option, key: @option1.key, title_multiloc: { en: 'different' }, custom_field: @custom_field2)

          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          end

          travel_to(start_at + 4.days) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => @option2.key }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => @option3.key })
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        describe 'when the custom field has no reference distribution' do
          include_examples('xlsx export', 'custom field (select)') do
            let(:expected_worksheet_name) { 'users_by_select_field' }
            let(:expected_worksheet_values) do
              [
                %w[option option_id users],
                ['youth council', @option1.key, 1],
                ['youth council', @option2.key, 1],
                ['youth council', @option3.key, 0],
                ['_blank', '_blank', 1]
              ]
            end
          end
        end

        describe 'when the custom field has a reference distribution' do
          before do
            create(:categorical_distribution, custom_field: @custom_field, distribution: {
              @option1.id => 80, @option3.id => 20
            })
          end

          include_examples('xlsx export', 'custom field (select) including expected nb of users') do
            let(:expected_worksheet_name) { 'users_by_select_field' }
            let(:expected_worksheet_values) do
              [
                %w[option option_id users expected_users reference_population],
                ['youth council', @option1.key, 1, 0.8, 80],
                ['youth council', @option2.key, 1, '', ''],
                ['youth council', @option3.key, 0, 0.2, 20],
                ['_blank', '_blank', 1, '', '']
              ]
            end
          end
        end
      end

      describe 'with multiselect field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_multiselect, key: 'multiselect_field')
          @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)
          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
          end

          travel_to(start_at + 6.days) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => [@option1.key, @option2.key] }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => [@option3.key] })
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => [@option1.key] }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        include_examples('xlsx export', 'custom field (multiselect)') do
          let(:expected_worksheet_name) { 'users_by_multiselect_field' }
          let(:expected_worksheet_values) do
            [
              %w[option option_id users],
              ['youth council', @option1.key, 2],
              ['youth council', @option2.key, 1],
              ['youth council', @option3.key, 0],
              ['_blank', '_blank', 1]
            ]
          end
        end
      end

      describe 'with checkbox field' do
        before do
          @group = create(:group)
          @custom_field = create(:custom_field_checkbox, key: 'checkbox_field')
          travel_to(start_at - 1.day) do
            create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
          end

          travel_to(start_at + 24.days) do
            create(:user, custom_field_values: { @custom_field.key => true }, manual_groups: [@group])
            create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
            create(:user, manual_groups: [@group])
          end

          travel_to(end_at + 1.day) do
            create(:user, custom_field_values: { @custom_field.key => true }, manual_groups: [@group])
          end
        end

        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        include_examples('xlsx export', 'custom field (checkbox)') do
          let(:expected_worksheet_name) { 'users_by_checkbox_field' }
          let(:expected_worksheet_values) do
            [
              %w[option users],
              ['false', 1],
              ['true', 1],
              ['_blank', 1]
            ]
          end
        end
      end
    end
  end

  describe 'by_age' do
    let(:start_at) { Time.zone.local(2019) }
    let(:end_at) { Time.zone.local(2020).end_of_year }

    # Here, we use a group filter to make sure not to capture unwanted users (e.g. the
    # user making the request). As it stands, the test case of counting all users
    # (without filters) by age is not covered.
    let(:group) { @group.id }

    before do
      AppConfiguration.instance.update(created_at: start_at)

      travel_to start_at + 16.days do
        birthyears = [1962, 1976, 1980, 1990, 1991, 2005, 2006]
        users = birthyears.map { |year| create(:user, birthyear: year) }
        user_without_birthyear = create(:user, birthyear: nil)

        @group = create_group(users + [user_without_birthyear])
      end
    end

    get 'web_api/v1/stats/users_by_age' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      context 'when the birthyear custom field has no reference distribution' do
        example 'Users counts by age' do
          travel_to(Time.zone.local(2020, 1, 1)) { do_request }

          expect(response_status).to eq 200
          expect(json_response_body).to match(
            total_user_count: 8,
            unknown_age_count: 1,
            series: {
              user_counts: [0, 2, 2, 1, 1, 1, 0, 0, 0, 0],
              expected_user_counts: nil,
              reference_population: nil,
              bins: UserCustomFields::AgeCounter::DEFAULT_BINS
            }
          )
        end
      end

      context 'when the birthyear custom field has a reference distribution' do
        let!(:ref_distribution) do
          create(
            :binned_distribution,
            bins: [nil, 25, 50, 75, nil],
            counts: [190, 279, 308, 213]
          )
        end

        example 'Users counts by age' do
          travel_to(Time.zone.local(2020, 1, 1)) { do_request }

          expect(response_status).to eq 200
          expect(json_response_body).to match(
            total_user_count: 8,
            unknown_age_count: 1,
            series: {
              user_counts: [2, 4, 1, 0],
              expected_user_counts: ref_distribution.expected_counts(7),
              reference_population: ref_distribution.counts,
              bins: ref_distribution.bin_boundaries
            }
          )
        end
      end
    end

    get 'web_api/v1/stats/users_by_age_as_xlsx' do
      time_boundary_parameters self
      group_filter_parameter self
      parameter :project, 'Project ID. Only return users that have participated in the given project.', required: false

      context 'when the birthyear custom field has no reference distribution' do
        include_examples('xlsx export', 'age', Time.zone.local(2020, 1, 1)) do
          let(:expected_worksheet_name) { 'users_by_age' }
          let(:expected_worksheet_values) do
            [
              %w[age user_count],
              ['0-9', 0],
              ['10-19', 2],
              ['20-29', 2],
              ['30-39', 1],
              ['40-49', 1],
              ['50-59', 1],
              ['60-69', 0],
              ['70-79', 0],
              ['80-89', 0],
              ['90+', 0],
              ['unknown', 1]
            ]
          end
        end
      end

      context 'when the birthyear custom field has a reference distribution' do
        let!(:ref_distribution) do
          create(
            :binned_distribution,
            bins: [nil, 25, 50, 75, nil],
            counts: [190, 279, 308, 213]
          )
        end

        include_examples('xlsx export', 'age', Time.zone.local(2020, 1, 1)) do
          let(:expected_worksheet_name) { 'users_by_age' }
          let(:expected_worksheet_values) do
            [
              %w[age user_count expected_user_count total_population],
              ['0-24', 2, 1.3, 190],
              ['25-49', 4, 2.0, 279],
              ['50-74', 1, 2.2, 308],
              ['75+', 0, 1.5, 213],
              ['unknown', 1, '', '']
            ]
          end
        end
      end
    end
  end
end
