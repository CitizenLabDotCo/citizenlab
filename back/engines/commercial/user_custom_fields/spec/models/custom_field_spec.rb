# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField do
  subject { build(:custom_field) }

  it { is_expected.to have_many(:ref_distributions) }

  describe 'before_destroy callbacks' do
    it 'destroys the dependent reference distributions' do
      ref_distribution = create(:categorical_distribution)
      # Check that the callback does not create an N+1 query problem.
      expect_any_instance_of(UserCustomFields::Representativeness::CategoricalDistribution)
        .not_to receive(:sync_with_options!)

      ref_distribution.custom_field.destroy!

      expect { ref_distribution.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
