# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField do
  subject { build(:custom_field) }

  it { is_expected.to have_many(:ref_distributions).dependent(:destroy) }
end
