# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldMatrixStatement do
  subject { build(:custom_field_matrix_statement) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to validate_presence_of(:title_multiloc) }

  it do
    # Create a matrix statement without a title so generate_key won't run
    subject = build(:custom_field_matrix_statement, title_multiloc: {})
    expect(subject).to validate_presence_of(:key)
  end

  it { is_expected.to validate_uniqueness_of(:key).scoped_to(:custom_field_id) }
end
