# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldOption do
  def create_ref_distribution(nb_options:)
    # The actual population counts does not matter.
    create(:categorical_distribution, population_counts: [10] * nb_options)
  end

  describe 'after_destroy callbacks' do
    # The ref_distribution is defined in nested examples.
    let(:option) { ref_distribution.options.first }

    context 'when there are at least 2 remaining options' do
      let(:ref_distribution) { create_ref_distribution(nb_options: 3) }

      it 'updates the current reference distribution' do
        option.destroy!
        ref_distribution.reload

        expect(ref_distribution.distribution).not_to include(option.id)
        expect(ref_distribution.distribution.size).to eq(2)
      end
    end

    context 'when there is less than 2 remaining options' do
      let(:ref_distribution) { create_ref_distribution(nb_options: 2) }

      it 'deletes the current reference distribution' do
        option.destroy!
        expect { ref_distribution.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
