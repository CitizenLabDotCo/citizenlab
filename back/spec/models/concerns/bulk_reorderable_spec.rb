# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkReorderable do
  # Using CustomField with a real CustomForm to test against the actual
  # deferrable unique constraint in the database.
  let(:custom_form) { create(:custom_form) }

  def create_field(ordering:)
    create(:custom_field, :for_custom_form, resource: custom_form, ordering: ordering)
  end

  def ordered_ids
    CustomField.where(resource: custom_form).order(:ordering).pluck(:id)
  end

  def orderings
    CustomField.where(resource: custom_form).order(:ordering).pluck(:ordering)
  end

  describe '.bulk_reorder!' do
    it 'reorders records to match the given ID sequence' do
      field_a = create_field(ordering: 0)
      field_b = create_field(ordering: 1)
      field_c = create_field(ordering: 2)

      CustomField.where(resource: custom_form).bulk_reorder!([field_c.id, field_a.id, field_b.id])

      expect(ordered_ids).to eq([field_c.id, field_a.id, field_b.id])
      expect(orderings).to eq([0, 1, 2])
    end

    it 'does not run an update when the order is unchanged' do
      field_a = create_field(ordering: 0)
      field_b = create_field(ordering: 1)

      expect do
        CustomField.where(resource: custom_form).bulk_reorder!([field_a.id, field_b.id])
      end.not_to exceed_query_limit(0).with(/UPDATE/)
    end

    it 'ignores missing IDs, appends orphaned IDs, and handles nil/duplicate IDs' do
      field_a = create_field(ordering: 0)
      field_b = create_field(ordering: 1)
      field_c = create_field(ordering: 2)
      non_existent_id = SecureRandom.uuid

      CustomField.where(resource: custom_form).bulk_reorder!(
        [nil, field_c.id, non_existent_id, field_c.id, field_a.id]
      )

      # field_c and field_a are reordered as requested.
      # field_b is orphaned and appended at the end.
      # The non-existent ID, nil, and duplicate are ignored.
      expect(ordered_ids).to eq([field_c.id, field_a.id, field_b.id])
      expect(orderings).to eq([0, 1, 2])
    end

    it 'handles an empty ordered_ids list' do
      field_a = create_field(ordering: 0)
      field_b = create_field(ordering: 1)

      CustomField.where(resource: custom_form).bulk_reorder!([])

      # All records are orphaned and retain their current relative order.
      expect(ordered_ids).to eq([field_a.id, field_b.id])
    end

    it 'does not affect records in a different scope' do
      other_form = create(:custom_form)
      field_a = create_field(ordering: 0)
      field_b = create_field(ordering: 1)
      other_field = create(:custom_field, :for_custom_form, resource: other_form, ordering: 0)

      CustomField.where(resource: custom_form).bulk_reorder!([field_b.id, field_a.id])

      expect(ordered_ids).to eq([field_b.id, field_a.id])
      expect(other_field.reload.ordering).to eq(0)
    end
  end
end
