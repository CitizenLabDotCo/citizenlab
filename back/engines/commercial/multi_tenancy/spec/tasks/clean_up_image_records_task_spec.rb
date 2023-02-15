# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'rake cl2back:clean_up_image_records' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['cl2back:clean_up_image_records'] }

  describe 'when processing text_images' do
    let(:project) { create(:continuous_project) }
    let(:images) { create_list(:text_image, 2, imageable_type: 'Project', imageable_id: project.id) }

    before do
      project.update!(
        description_multiloc: { en: "<p><img data-cl2-text-image-text-reference=\"#{images[0].text_reference}\"></p>" }
      )
    end

    it 'destroys unused text_images records' do
      expect(TextImage.all).to include(images[0], images[1])
      task.execute
      expect(TextImage.all).to include(images[0])
      expect(TextImage.all).not_to include(images[1])
    end

    it 'destroys text_images with blank image field' do
      expect(TextImage.all).to include(images[0])
      images[0].remove_image!
      images[0].save!
      task.execute
      expect(TextImage.all).not_to include(images[0])
    end
  end
end
# rubocop:enable RSpec/DescribeClass
