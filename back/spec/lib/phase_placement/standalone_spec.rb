# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhasePlacement::Standalone do
  subject(:placement) { described_class.new }

  its(:sequential?) { is_expected.to be false }
  its(:presented_as_page?) { is_expected.to be false }
end
