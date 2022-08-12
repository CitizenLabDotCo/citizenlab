# frozen_string_literal: true

RSpec.shared_examples 'reference distribution' do |factory_name|
  subject(:ref_distribution) { build(factory_name) }

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to validate_uniqueness_of(:custom_field_id).case_insensitive }
  it { is_expected.to validate_presence_of(:distribution) }
  it { is_expected.to validate_presence_of(:type) }

  # This group of examples runs only if the :assign_counts helper method is defined to
  # allow tests to assign new counts to the reference distribution.
  #
  #   def transform_counts(ref_distribution, &block)
  #    ...
  #   end
  #
  # It needs to be defined in the context that includes the shared examples because the
  # implementation of the helper depends on the type of reference distribution. Look for
  # usages in the code for examples.
  #
  # Note that the distribution classes themselves do not provide a generic way to set
  # the counts (:counts=). That's because:
  # - This method would have very little practical use outside of testing.
  # - It is also ill-defined for some classes of distributions, where setting counts
  #   without additional context does not make sense (e.g. +CategoricalDistribution+).
  skip_counts_validation_tests = <<~REASON.chomp unless method_defined?(:transform_counts)
    :transform_counts helper method is not defined.
  REASON

  example_group '[counts validations]', skip: skip_counts_validation_tests do
    def replace_first_count(ref_distribution, new_count)
      transform_counts(ref_distribution) do |counts|
        [new_count, *counts[1..]]
      end
    end

    it 'validates that the distribution counts are not negative', :aggregate_failures do
      replace_first_count(ref_distribution, -1)

      expect(ref_distribution).not_to be_valid
      expect(ref_distribution.errors.messages[:distribution])
        .to include('population counts must be strictly positive.')
    end

    it 'validates that the distribution counts are not zero', :aggregate_failures do
      replace_first_count(ref_distribution, 0)

      expect(ref_distribution).not_to be_valid
      expect(ref_distribution.errors.messages[:distribution])
        .to include('population counts must be strictly positive.')
    end

    it 'validates that the distribution counts are integers', :aggregate_failures do
      replace_first_count(ref_distribution, 1.5)

      expect(ref_distribution).not_to be_valid
      expect(ref_distribution.errors.messages[:distribution])
        .to include('population counts must be integers.')
    end

    it 'validates that the distribution counts are not nil', :aggregate_failures do
      replace_first_count(ref_distribution, nil)

      expect(ref_distribution).not_to be_valid
      expect(ref_distribution.errors.messages[:distribution])
        .to include('population counts cannot be nil.')
    end
  end
end
