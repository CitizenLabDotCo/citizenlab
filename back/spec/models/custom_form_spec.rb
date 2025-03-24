# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomForm do
  describe '#heal_fields_ordering!' do
    let(:form) { create(:custom_form) }

    it 'moves the first container field to the first position' do
      f1, f2 = form.custom_fields = [
        create(:custom_field_text, ordering: 0),
        create(:custom_field_page, ordering: 1)
      ]

      form.heal_fields_ordering!

      expect(form.custom_fields.reload).to eq [f2, f1]
      expect(form.custom_fields.pluck(:ordering)).to eq [0, 1]
    end

    it 'breaks the ordering ties (page comes first)' do
      f1, f2, f3 = form.custom_fields = [
        create(:custom_field_text, ordering: 0),
        create(:custom_field_page, ordering: 0),
        create(:custom_field_page, ordering: 1)
      ]

      form.heal_fields_ordering!

      expect(form.custom_fields.reload).to match_array [f2, f1, f3]
      expect(form.custom_fields.pluck(:ordering)).to eq [0, 1, 2]
    end
  end
end
