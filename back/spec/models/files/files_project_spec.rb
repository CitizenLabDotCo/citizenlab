# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::FilesProject do
  subject(:files_project) { build(:files_project) }

  it { is_expected.to be_valid }

  describe 'associations' do
    it { is_expected.to belong_to(:file).class_name('Files::File').inverse_of(:files_projects).required }
    it { is_expected.to belong_to(:project).class_name('Project').inverse_of(:files_projects).required }
  end

  describe 'validations' do
    it { is_expected.to validate_uniqueness_of(:file_id).scoped_to(:project_id).case_insensitive }
  end
end
