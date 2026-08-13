# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::FieldValueCounter do
  subject(:counts) { described_class.counts_by_field_option(records, custom_field, **options) }

  let(:records) { User.active }
  let(:options) { {} }

  describe '.counts_by_field_option' do
    context 'when custom field values are inconsistent with custom field options' do
      let(:custom_field) { create(:custom_field_gender, :with_options) }

      before do
        # Create user with invalid value for gender custom field.
        user = build(:user, gender: 'unicorn')
        user.save!(validate: false)
      end

      it 'compute counts without raising an error', :aggregate_failures do
        expect(ErrorReporter).to receive(:report).with(kind_of(ArgumentError))
        expect { counts }.not_to raise_error
        expect(counts).to match('unicorn' => 1, described_class::UNKNOWN_VALUE_LABEL => 0)
      end
    end

    context "when 'by' option is ':area_id'" do
      let(:options) { { by: :area_id } }
      let(:area) { create(:area) }

      before do
        # Domicile field must be created before the user, otherwise the user is not
        # valid.
        @domicile_field = create(:custom_field_domicile)
        create(:user, domicile: area.id)
      end

      context 'and custom field is domicile' do
        let(:custom_field) { @domicile_field }

        it 'returns counts indexed by area id' do
          expect(counts.keys).to contain_exactly(area.id, 'outside', described_class::UNKNOWN_VALUE_LABEL)
        end
      end

      context 'and custom field is not domicile' do
        let(:custom_field) { create(:custom_field_gender, :with_options) }

        specify { expect { counts }.to raise_error(ArgumentError) }
      end
    end

    context 'when custom field is domicile' do
      let_it_be(:custom_field) { create(:custom_field_domicile) }
      let_it_be(:areas) { create_list(:area, 2) }

      it 'do not report about inconsistent option keys to Sentry' do
        # Regression test. For the test to be effective, we need at least one user with
        # domicile. The code expected option keys, while domicile field uses area ids in
        # custom_field_values. This resulted in warnings about unknown option keys.
        create(:user, domicile: areas.first.id)
        expect(ErrorReporter).not_to receive(:report)
        counts
      end

      it 'add missing areas with a null count', :aggregate_failures do
        expected_keys = custom_field.options.pluck(:key) << described_class::UNKNOWN_VALUE_LABEL
        expect(counts.keys).to match_array(expected_keys)
        expect(counts.values).to all eq(0)
      end

      context 'when values reference an area that no longer exists' do
        # Regression test. Deleting an area does not clean up the domicile answers a
        # survey form stored on its inputs, so those values keep pointing at a deleted
        # area. Mapping the area ids back onto option keys used to raise a KeyError,
        # which made every consumer of these counts (phase insights, reporting widgets)
        # return a 500.
        subject(:counts) do
          described_class.counts_by_field_option(custom_field_values, custom_field)
        end

        let(:deleted_area_id) { SecureRandom.uuid }
        let(:custom_field_values) do
          [
            { 'domicile' => areas.first.id },
            { 'domicile' => deleted_area_id },
            { 'domicile' => deleted_area_id },
            {}
          ]
        end

        it 'counts them as blank instead of raising', :aggregate_failures do
          expect { counts }.not_to raise_error

          first_area_option_key = areas.first.custom_field_option.key
          expect(counts[first_area_option_key]).to eq 1
          # 2 answers pointing at the deleted area + 1 answer that was left empty.
          expect(counts[described_class::UNKNOWN_VALUE_LABEL]).to eq 3
        end

        it 'keeps the total count intact' do
          expect(counts.values.sum).to eq custom_field_values.size
        end

        it 'does not leak the deleted area id into the counts' do
          expect(counts.keys).not_to include deleted_area_id
        end
      end
    end

    context 'when user fields are stored in ideas' do
      let(:custom_field) { create(:custom_field_gender, :with_options) }
      let(:options) { { record_type: 'ideas' } }
      let(:records) do
        create(:idea_status_proposed)
        create(:idea, author: nil, custom_field_values: { "u_#{custom_field.key}" => 'male' })
        create(:idea, author: nil, custom_field_values: { "u_#{custom_field.key}" => 'female' })
        create(:idea, author: nil, custom_field_values: {})
        Idea.all
      end

      it 'adds counts from user fields stored in ideas' do
        expect(counts).to match('male' => 1, 'female' => 1, 'unspecified' => 0, described_class::UNKNOWN_VALUE_LABEL => 1)
      end
    end

    context 'when passing an array of custom field values instead of a relation' do
      let(:select_field) { create(:custom_field_select, :with_options) }
      let(:multiselect_field) { create(:custom_field_multiselect, :with_options) }

      before do
        create(:user, custom_field_values: { select_field.key => 'option1', multiselect_field.key => %w[option1 option2] })
        create(:user, custom_field_values: { select_field.key => 'option2', multiselect_field.key => %w[option2] })
        create(:user)
      end

      it 'returns the same counts as the SQL implementation' do
        [select_field, multiselect_field].each do |field|
          sql_counts = described_class.counts_by_field_option(User.all, field)
          in_memory_counts = described_class.counts_by_field_option(User.all.map(&:custom_field_values), field)

          expect(in_memory_counts).to eq(sql_counts)
        end

        expect(described_class.counts_by_field_option(User.all, select_field))
          .to match('option1' => 1, 'option2' => 1, described_class::UNKNOWN_VALUE_LABEL => 1)
      end
    end
  end
end
