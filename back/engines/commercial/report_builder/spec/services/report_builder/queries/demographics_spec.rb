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

        AppConfiguration.update!(created_at: Date.new(2020, 1, 1))
      end

      it 'works' do
        result = query.run_query(@custom_field.id)

        # expect(result).to match({
        #   options: {
        #     @option1.key => { title_multiloc: @option1.title_multiloc, ordering: 0 },
        #     @option2.key => { title_multiloc: @option2.title_multiloc, ordering: 1 },
        #     @option3.key => { title_multiloc: @option3.title_multiloc, ordering: 2 }
        #   },
        #   series: {
        #     reference_population: nil,
        #     users: {
        #       @option1.key => 1,
        #       @option2.key => 1,
        #       @option3.key => 0,
        #       _blank: 1
        #     }
        #   }
        # })
        expect(result).to match({
          @option1.key => 3,
          @option2.key => 1,
          @option3.key => 1,
          '_blank' => 1
        })
      end

      # it 'works with date filter' do

      # end

      # it 'works with project filter' do

      # end

      # it 'works with group filter' do

      # end
    end
  end
end
