# frozen_string_literal: true

RSpec.shared_examples 'reference distribution' do |distribution_class, factory_name|
  subject(:ref_distribution) { build(factory_name) }

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to validate_uniqueness_of(:custom_field_id).case_insensitive }
  it { is_expected.to validate_presence_of(:distribution) }
  it { is_expected.to validate_presence_of(:type) }

  it do
    allowed_types = described_class.descendants.map(&:name)
    expect(subject).to validate_inclusion_of(:type).in_array(allowed_types)
  end

  skip_counts_validation_tests = <<~REASON.chomp unless distribution_class.method_defined?(:counts=)
    reference distribution does not respond to :counts=
  REASON

  # This group of examples runs only if the distribution class provides a generic way
  # to set the counts (:counts=). This method has very little practical use outside of
  # testing. It is also ill-defined for some classes of distributions, where setting
  # counts without additional context does not make sense (e.g.
  # +CategoricalDistribution+).
  #
  # For those reasons, the method is typically not implemented directly in the class,
  # but patched into it in the test files before including this group of examples.
  # Look for usages in the code for an example.
  example_group '[counts validations]', skip: skip_counts_validation_tests do
    def replace_first_count(ref_distribution, new_count)
      counts = ref_distribution.send(:counts).dup
      counts[0] = new_count
      ref_distribution.counts = counts
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
