# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::IdeaImport do
  subject { build(:idea_import) }

  describe 'validations' do
    it { is_expected.to be_valid }
  end
end
