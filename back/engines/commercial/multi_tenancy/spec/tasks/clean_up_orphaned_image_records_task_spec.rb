# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'rake cl2back:clean_up_image_records' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['cl2back:clean_up_orphaned_image_records'] }

  describe 'when processing layout_images' do
    let(:layout) { create(:layout, code: 'project_description') }
    let(:images) { create_list(:layout_image, 2, created_at: 1.day.ago) }

    it 'destroys unused layout_images records' do
      craftjs_str = ERB.new(File.read('spec/fixtures/craftjs_layout_with_2_images.json.erb'))
        .result_with_hash(code1: images[0].code, code2: SecureRandom.uuid)

      layout.update!(craftjs_jsonmultiloc: JSON.parse(craftjs_str))

      expect(ContentBuilder::LayoutImage.all).to include(images[0], images[1])
      task.execute(execute: 'execute')
      expect(ContentBuilder::LayoutImage.all).to include(images[0])
      expect(ContentBuilder::LayoutImage.all).not_to include(images[1])
    end

    # layout_images are created whenever an admin adds an image to a layout form, regardless of whether that image
    # is eventually referenced by a layout (when / if the layout is saved).
    # By only destroying unused layout_images with an age > 6 hours, we can be reasonably confident that the
    # admin does not intend to add the image to a layout, and the image is truly orphaned.
    it 'does not destroy unused layout_images records created less than 6 hours ago' do
      images[1].update(created_at: 5.hours.ago)

      expect(ContentBuilder::LayoutImage.all).to include(images[0], images[1])
      task.execute(execute: 'execute')
      expect(ContentBuilder::LayoutImage.all).to include(images[1])
      expect(ContentBuilder::LayoutImage.all).not_to include(images[0])
    end
  end

  describe 'when processing text_images' do
    let(:project) { create(:continuous_project) }
    let(:images) { create_list(:text_image, 2, imageable_type: 'Project', imageable_id: project.id) }

    it 'destroys unused text_images records' do
      project.update!(
        description_multiloc: { en: "<p><img data-cl2-text-image-text-reference=\"#{images[0].text_reference}\"></p>" }
      )

      expect(TextImage.all).to include(images[0], images[1])
      task.execute(execute: 'execute')
      expect(TextImage.all).to include(images[0])
      expect(TextImage.all).not_to include(images[1])
    end
  end
end
# rubocop:enable RSpec/DescribeClass
