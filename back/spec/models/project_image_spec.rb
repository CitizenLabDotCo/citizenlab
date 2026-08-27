# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectImage do
  subject { create(:project_image) }

  it_behaves_like 'a plain text multiloc', factory: :project_image, attribute: :alt_text_multiloc

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_image)).to be_valid
    end
  end

  it { is_expected.to belong_to(:project) }
  it { is_expected.to validate_presence_of(:project) }
  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }

  describe 'image presence' do
    it 'is invalid without an image' do
      project_image = build(:project_image, image: nil)

      expect(project_image).to be_invalid
      expect(project_image.errors.details[:image]).to include(error: :blank)
    end

    it 'is valid without an image when the presence check is skipped' do
      project_image = build(:project_image, image: nil)
      project_image.skip_image_presence = true

      expect(project_image).to be_valid
    end

    it 'is invalid when its image is removed' do
      project_image = create(:project_image)
      # Remove the image by calling the remove_image! method, which is provided by CarrierWave
      project_image.remove_image!

      expect(project_image).to be_invalid
    end
  end
end
