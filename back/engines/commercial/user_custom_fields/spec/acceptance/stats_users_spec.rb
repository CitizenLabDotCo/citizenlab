require 'rails_helper'
require 'rspec_api_documentation/dsl'

multiloc_service = MultilocService.new

def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only return users that are a member of the given group", required: false
end

resource "Stats - Users" do

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    create(:custom_field_birthyear)
    create(:custom_field_gender, :with_options)
    create(:custom_field_domicile)
    create(:custom_field_education, :with_options)

    CustomField.find_by(code: 'education').update(enabled: true)

    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    Tenant.current.update!(created_at: now - 2.year)
    @timezone = AppConfiguration.instance.settings('core','timezone')

    travel_to(start_at - 1.day) { create(:user) }
    travel_to(end_at + 1.day) { create(:user) }
  end

  let (:start_at) { (now-1.year).in_time_zone(@timezone).beginning_of_year }
  let (:end_at) { (now-1.year).in_time_zone(@timezone).end_of_year }

  get "web_api/v1/stats/users_by_gender" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 16.days do
        create_list(:user, 2, gender: 'female')
        create(:user, gender: 'unspecified')
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user)
      end
    end

    let(:group) { @group.id }

    example_request "Users by gender" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        series: {
          users: {
            female: 2,
            unspecified: 1,
            _blank: 0,
          }
        }
      })
    end
  end

  get "web_api/v1/stats/users_by_gender_as_xlsx" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 16.days do
        create_list(:user, 2, gender: 'female')
        create_list(:user, 1, gender: 'male')
        create(:user, gender: 'unspecified')
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user)
      end
    end

    let(:group) { @group.id }

    example_request "Users by gender" do
      expect(response_status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet[0].cells.map(&:value)).to match ['gender', 'users']

      genders_col = worksheet.map {|col| col.cells[0].value}
      header, *genders = genders_col
      expect(genders).to match_array ['_blank', 'unspecified', 'male', 'female']

      amount_col = worksheet.map {|col| col.cells[1].value}
      header, *amounts = amount_col
      expect(amounts).to match_array [0, 1, 1, 2]
    end
  end

  get "web_api/v1/stats/users_by_birthyear" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    describe "filtered by group" do
    before do
      travel_to start_at + 16.days do
        create_list(:user, 2, birthyear: 1980)
        create(:user, birthyear: 1976)
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, birthyear: 1980)
      end
    end

    let(:group) { @group.id }

    example_request "Users by birthyear" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        series: {
          users: {
            '1980': 2,
            '1976': 1,
            _blank: 0,
          }
        }
      })
    end
  end
  describe "filtered by project" do
    before do
      travel_to start_at + 16.days do
        create_list(:user, 2, birthyear: 1980)
        create(:user, birthyear: 1976)
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, birthyear: 1980)
      end
      travel_to start_at + 18.days do
        @project = create(:project)
        @idea1 = create(:idea, project: @project)
        create(:published_activity, item: @idea1, user: @idea1.author)
      end
    end

    let(:project) { @project.id }

    example_request "Users by birthyear filtered by project" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:series][:users].values.inject(&:+)).to eq 1
    end
  end
end

  get "web_api/v1/stats/users_by_birthyear_as_xlsx" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 16.days do
        create_list(:user, 2, birthyear: 1980)
        create(:user, birthyear: 1976)
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, birthyear: 1980)
      end
    end

    let(:group) { @group.id }

    example_request "Users by birthyear" do
      expect(response_status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet[0].cells.map(&:value)).to match ['birthyear', 'users']

      birthyears_col = worksheet.map {|col| col.cells[0].value}
      header, *birthyears = birthyears_col
      expect(birthyears).to match_array [1976, 1980, "_blank"]

      amount_col = worksheet.map {|col| col.cells[1].value}
      header, *amounts = amount_col
      expect(amounts).to match_array [1, 2, 0]
    end
  end

  get "web_api/v1/stats/users_by_domicile" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 16.days do
        @area1, @area2, @area3 = create_list(:area, 3)
        create_list(:user, 2, domicile: @area1.id)
        create(:user, domicile: @area2.id)
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, birthyear: 1980)
      end
    end

    let(:group) { @group.id }

    example_request "Users by domicile" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        areas: {
          @area1.id.to_sym => { title_multiloc: @area1.title_multiloc.symbolize_keys },
          @area2.id.to_sym => { title_multiloc: @area2.title_multiloc.symbolize_keys },
          @area3.id.to_sym => { title_multiloc: @area3.title_multiloc.symbolize_keys }
        },
        series: {
          users: {
            @area1.id.to_sym => 2,
            @area2.id.to_sym  => 1,
            _blank: 0
          }
        }
      })
    end
  end

  get "web_api/v1/stats/users_by_domicile_as_xlsx" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 16.days do
        @area1, @area2, @area3 = create_list(:area, 3)
        create_list(:user, 2, domicile: @area1.id)
        create(:user, domicile: @area2.id)
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, birthyear: 1980)
      end
    end

    let(:group) { @group.id }

    example_request "Users by domicile" do
      expect(response_status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet[0].cells.map(&:value)).to match ["area", "area_id", "users"]

      areas_col = worksheet.map {|col| col.cells[1].value}
      header, *areas = areas_col
      expect(areas).to match_array [@area1.id, @area2.id, @area3.id, "_blank"]

      amount_col = worksheet.map {|col| col.cells[2].value}
      header, *amounts = amount_col
      expect(amounts).to match_array [0, 1, 2, 0]
    end
  end

  get "web_api/v1/stats/users_by_education" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 24.days do
        create_list(:user, 2, education: '3')
        create(:user, education: '5')
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, education: '3')
      end
    end

    let(:group) { @group.id }

    example_request "Users by education" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        series: {
          users: {
            '3': 2,
            '5': 1,
            _blank: 0,
          }
        }
      })
    end
  end
  get "web_api/v1/stats/users_by_education_as_xlsx" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    before do
      travel_to start_at + 24.days do
        create_list(:user, 2, education: '3')
        create(:user, education: '5')
        @group = create(:group)
        User.all.each{|u| create(:membership, user: u, group: @group)}
        create(:user, education: '3')
      end
    end

    let(:group) { @group.id }

    example_request "Users by education" do
      expect(response_status).to eq 200
      worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
      expect(worksheet[0].cells.map(&:value)).to match ["education", "users"]

      areas_col = worksheet.map {|col| col.cells[0].value}
      header, *areas = areas_col
      expect(areas).to match_array [3, 5, "_blank"]

      amount_col = worksheet.map {|col| col.cells[1].value}
      header, *amounts = amount_col
      expect(amounts).to match_array [2, 1, 0]
    end
  end

  get "web_api/v1/stats/users_by_custom_field/:custom_field_id" do
    time_boundary_parameters self
    group_filter_parameter self
    parameter :project, "Project ID. Only return users that have participated in the given project.", required: false

    describe "with select field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_select)
        @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)

        # We create an option on a different custom_field, but with the same
        # key. This covers a regressions that mixed up custom field options
        # between fields
        @custom_field2 = create(:custom_field_select)
        create(:custom_field_option, key: @option1.key, title_multiloc: {en: 'different'}, custom_field: @custom_field2)

        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
        end

        travel_to(start_at + 4.days) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => @option2.key}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => @option3.key})
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
        end

      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (select)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          options: {
            @option1.key.to_sym => { title_multiloc: @option1.title_multiloc.symbolize_keys },
            @option2.key.to_sym => { title_multiloc: @option2.title_multiloc.symbolize_keys },
            @option3.key.to_sym => { title_multiloc: @option3.title_multiloc.symbolize_keys },
          },
          series: {
            users: {
              @option1.key.to_sym => 1,
              @option2.key.to_sym => 1,
              _blank: 1
            }
          }
        })
      end

    end


    describe "with multiselect field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_multiselect)
        @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)
        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
        end

        travel_to(start_at + 6.days) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => [@option1.key, @option2.key]}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => [@option3.key]})
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
        end

      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (multiselect)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          options: {
            @option1.key.to_sym => { title_multiloc: @option1.title_multiloc.symbolize_keys },
            @option2.key.to_sym => { title_multiloc: @option2.title_multiloc.symbolize_keys },
            @option3.key.to_sym => { title_multiloc: @option3.title_multiloc.symbolize_keys },
          },
          series: {
            users: {
              @option1.key.to_sym => 2,
              @option2.key.to_sym => 1,
              _blank: 1
            }
          }
        })
      end
    end

    describe "with checkbox field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_checkbox)
        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => false}, manual_groups: [@group])
        end

        travel_to(start_at + 24.days) do
          create(:user, custom_field_values: { @custom_field.key => true}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => false}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => true}, manual_groups: [@group])
        end
      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (checkbox)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          series: {
            users: {
              true: 1,
              false: 1,
              _blank: 1
            }
          }
        })
      end
    end
  end

  get "web_api/v1/stats/users_by_custom_field_as_xlsx/:custom_field_id" do
    time_boundary_parameters self
    group_filter_parameter self

    describe "with select field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_select)
        @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)

        # We create an option on a different custom_field, but with the same
        # key. This covers a regressions that mixed up custom field options
        # between fields
        @custom_field2 = create(:custom_field_select)
        create(:custom_field_option, key: @option1.key, title_multiloc: {en: 'different'}, custom_field: @custom_field2)

        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
        end

        travel_to(start_at + 4.days) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => @option2.key}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => @option3.key})
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key}, manual_groups: [@group])
        end

      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (select)" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ["option", "option_id", "users"]

        option_titles_col = worksheet.map {|col| col.cells[0].value}
        header, *option_titles = option_titles_col
        expect(option_titles).to match_array [multiloc_service.t(@option1.title_multiloc), multiloc_service.t(@option2.title_multiloc), multiloc_service.t(@option3.title_multiloc), "unknown"]

        option_ids_col = worksheet.map {|col| col.cells[1].value}
        header, *option_ids = option_ids_col
        expect(option_ids).to match_array [@option1.key, @option2.key, @option3.key, "_blank"]

        users_col = worksheet.map {|col| col.cells[2].value}
        header, *users = users_col
        expect(users).to match_array [0, 1, 1, 1]
      end

    end


    describe "with multiselect field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_multiselect)
        @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)
        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
        end

        travel_to(start_at + 6.days) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => [@option1.key, @option2.key]}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => [@option3.key]})
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => [@option1.key]}, manual_groups: [@group])
        end

      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (multiselect)" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ["option", "option_id", "users"]

        option_titles_col = worksheet.map {|col| col.cells[0].value}
        header, *option_titles = option_titles_col
        expect(option_titles).to match_array [multiloc_service.t(@option1.title_multiloc), multiloc_service.t(@option2.title_multiloc), multiloc_service.t(@option3.title_multiloc), "unknown"]

        users_col = worksheet.map {|col| col.cells[2].value}
        header, *users = users_col
        expect(users).to match_array [0, 2, 1, 1]
      end
    end

    describe "with checkbox field" do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_checkbox)
        travel_to(start_at - 1.day) do
          create(:user, custom_field_values: { @custom_field.key => false}, manual_groups: [@group])
        end

        travel_to(start_at + 24.days) do
          create(:user, custom_field_values: { @custom_field.key => true}, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => false}, manual_groups: [@group])
          create(:user, manual_groups: [@group])
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => true}, manual_groups: [@group])
        end
      end

      let(:group) { @group.id }
      let(:custom_field_id) { @custom_field.id }

      example_request "Users by custom field (checkbox)" do
        expect(response_status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0].cells.map(&:value)).to match ["option", "users"]

        option_ids_col = worksheet.map {|col| col.cells[0].value}
        header, *option_ids = option_ids_col
        expect(option_ids).to match_array ["_blank", "false", "true"]

        users_col = worksheet.map {|col| col.cells[1].value}
        header, *users = users_col
        expect(users).to match_array [1, 1, 1]
      end
    end
  end
end