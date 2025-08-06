# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::Preview do
  subject(:preview) { build(:file_preview) }

  it { is_expected.to be_valid }
end
