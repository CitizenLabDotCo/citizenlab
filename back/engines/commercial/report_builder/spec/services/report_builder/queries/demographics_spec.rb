# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::Demographics do
  subject(:query) { described_class.new(build(:admin)) }

  let_it_be(:timezone) { AppConfiguration.instance.settings('core', 'timezone') }
  let_it_be(:now) { Time.now.in_time_zone(timezone) }
  let_it_be(:start_at) { (now - 1.year).in_time_zone(timezone).beginning_of_year }
  let_it_be(:end_at) { (now - 1.year).in_time_zone(timezone).end_of_year }

  describe '#run_query' do
    context 'select field' do
      before do
        @group = create(:group)
        @custom_field = create(:custom_field_select)
        @option1, @option2, @option3 = create_list(:custom_field_option, 3, custom_field: @custom_field)
        @project = create(:project_with_active_ideation_phase)

        travel_to(start_at - 1.day) do
          user1 = create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          create(:idea, author: user1, project: @project)
        end

        travel_to(start_at + 4.days) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
          create(:user, custom_field_values: { @custom_field.key => @option2.key }, manual_groups: [@group])
          create(:user, manual_groups: [@group])
          user2 = create(:user, custom_field_values: { @custom_field.key => @option3.key })
          create(:idea, author: user2, project: @project)
        end

        travel_to(end_at + 1.day) do
          create(:user, custom_field_values: { @custom_field.key => @option1.key }, manual_groups: [@group])
        end

        AppConfiguration.update!(created_at: Date.new(2020, 1, 1))
      end

      it 'returns multilocs' do
        result = query.run_query(custom_field_id: @custom_field.id)

        multilocs = @custom_field.options.to_h do |o|
          [o.key, o.attributes.slice('title_multiloc', 'ordering')]
        end

        expect(result[:options]).to match(multilocs)
      end

      it 'returns correct series data' do
        result = query.run_query(custom_field_id: @custom_field.id)

        expect(result[:series]).to match({
          @option1.key => 3,
          @option2.key => 1,
          @option3.key => 1,
          '_blank' => 1
        })
      end

      it 'works with date filter' do
        result = query.run_query(custom_field_id: @custom_field.id, start_at: start_at, end_at: end_at)

        expect(result[:series]).to match({
          @option1.key => 1,
          @option2.key => 1,
          @option3.key => 1,
          '_blank' => 1
        })
      end

      it 'works with project filter' do
        result = query.run_query(custom_field_id: @custom_field.id, project_id: @project.id)

        expect(result[:series]).to match({
          @option1.key => 1,
          @option2.key => 0,
          @option3.key => 1,
          '_blank' => 0
        })
      end

      it 'works with group filter' do
        result = query.run_query(custom_field_id: @custom_field.id, group_id: @group.id)

        expect(result[:series]).to match({
          @option1.key => 3,
          @option2.key => 1,
          @option3.key => 0,
          '_blank' => 1
        })
      end
    end

    context 'birthyear field' do
      before do
        options = []
        @birthyear_field = create(:custom_field, key: :birthyear, options: options, input_type: :select)

        create(
          :user,
          registration_completed_at: start_at + 4.days,
          custom_field_values: { birthyear: 1977 }
        )

        AppConfiguration.update!(created_at: Date.new(2020, 1, 1))
      end

      it 'returns correct series data' do
        result = query.run_query(custom_field_id: @birthyear_field.id)
        expect(result[:series]).to eq({ '_blank' => 0, 1977 => 1 })
      end
    end
  end
end
