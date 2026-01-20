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

def participant_filter_parameter(s)
  s.parameter :filter_by_participation, 'Filter by participants', required: false
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

  let_it_be(:now) { AppConfiguration.timezone.now }
  let_it_be(:start_at) { (now - 1.year).beginning_of_year }
  let_it_be(:end_at) { (now - 1.year).end_of_year }

  before_all do
    AppConfiguration.instance.update!(created_at: now - 2.years, platform_start_at: now - 2.years)

    create(:custom_field_birthyear)
    create(:custom_field_gender, :with_options)
    create(:custom_field_domicile)

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
            expect(json_response_body.dig(:data, :attributes)).to match({
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
                reference_population: nil
              }
            }.deep_symbolize_keys)
          end
        end

        context 'when the custom field has a reference distribution' do
          before { create(:categorical_distribution, custom_field: @custom_field) }

          example_request 'Users by custom field (select) including reference population' do
            expect(response_status).to eq 200
            reference_population = json_response_body.dig(:data, :attributes, :series, :reference_population)
            expect(reference_population).to match({
              @option1.key => 450,
              @option2.key => 550,
              @option3.key => 450
            }.deep_symbolize_keys)
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
          expect(json_response_body.dig(:data, :attributes)).to match({
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
          expect(json_response_body.dig(:data, :attributes)).to match({
            series: {
              users: {
                # rubocop:disable Lint/BooleanSymbol
                true: 1,
                false: 1,
                # rubocop:enable Lint/BooleanSymbol
                _blank: 1
              },
              reference_population: nil
            }
          })
        end
      end
    end

    get 'web_api/v1/stats/users_by_custom_field/:custom_field_id' do
      time_boundary_parameters self
      group_filter_parameter self
      participant_filter_parameter self
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_checkbox)

        travel_to(start_at + 24.days) do
          create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
          user = create(:user, custom_field_values: { @custom_field.key => false }, manual_groups: [@group])
          idea = create(:idea, author: nil)
          create(:comment, idea: idea, author: user)
        end

        Analytics::PopulateDimensionsService.populate_types
      end

      describe 'with filter by participation' do
        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }
        let(:filter_by_participation) { true }

        example_request 'Users by custom field (filtered)' do
          expect(response_status).to eq 200
          expect(json_response_body.dig(:data, :attributes)).to match({
            series: {
              users: {
                # rubocop:disable Lint/BooleanSymbol
                false: 1,
                # rubocop:enable Lint/BooleanSymbol
                _blank: 0
              },
              reference_population: nil
            }
          })
        end
      end

      describe 'without filter by participation' do
        let(:group) { @group.id }
        let(:custom_field_id) { @custom_field.id }

        example_request 'Users by custom field (filtered)' do
          expect(response_status).to eq 200
          expect(json_response_body.dig(:data, :attributes)).to match({
            series: {
              users: {
                # rubocop:disable Lint/BooleanSymbol
                false: 3,
                # rubocop:enable Lint/BooleanSymbol
                _blank: 0
              },
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
                %w[option users],
                ['youth council', 1],
                ['youth council', 1],
                ['youth council', 0],
                ['_blank', 1]
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
                %w[option users reference_population],
                ['youth council', 1, 80],
                ['youth council', 1, ''],
                ['youth council', 0, 20],
                ['_blank', 1, '']
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
              %w[option users],
              ['youth council', 2],
              ['youth council', 1],
              ['youth council', 0],
              ['_blank', 1]
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
      AppConfiguration.instance.update(created_at: start_at, platform_start_at: start_at)

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
          expect(json_response_body.dig(:data, :attributes)).to match(
            total_user_count: 8,
            unknown_age_count: 1,
            series: {
              user_counts: [0, 2, 2, 1, 1, 1, 0, 0, 0, 0],
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
          expect(json_response_body.dig(:data, :attributes)).to match(
            total_user_count: 8,
            unknown_age_count: 1,
            series: {
              user_counts: [2, 4, 1, 0],
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
              %w[age user_count total_population],
              ['0-24', 2, 190],
              ['25-49', 4, 279],
              ['50-74', 1, 308],
              ['75+', 0, 213],
              ['unknown', 1, '']
            ]
          end
        end
      end
    end
  end
end
