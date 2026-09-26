# frozen_string_literal: true

require 'rails_helper'
require 'carrierwave/test/matchers'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:reprocess_layout_images rake task' do
  include CarrierWave::Test::Matchers

  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:reprocess_layout_images'].reenable
    FileUtils.rm_f(Rails.root.join('reprocess_layout_images.json'))
    FileUtils.rm_f(Rails.root.join('reprocess_layout_images_dry_run.json'))
    FileUtils.rm_rf(tmp_dir)
  end

  let(:tmp_dir) { Dir.mktmpdir }

  # Stored without processing, like the layout images uploaded before they were shrunk.
  let!(:layout_image) do
    path = File.join(tmp_dir, 'photo.jpg')
    MiniMagick::Tool::Convert.new { |convert| convert << '-size' << '3000x2000' << 'xc:red' << path }
    create(:layout_image, image: File.open(path))
  end

  def run_task(dry_run: false)
    ContentBuilder::LayoutImageUploader.enable_processing = true
    Rake::Task['single_use:reprocess_layout_images'].invoke(dry_run ? nil : 'execute', nil)
  ensure
    ContentBuilder::LayoutImageUploader.enable_processing = false
  end

  it 'shrinks the image under the same file name' do
    identifier = layout_image.read_attribute(:image)

    run_task

    layout_image.reload
    expect(layout_image.read_attribute(:image)).to eq identifier
    expect(layout_image.image).to have_dimensions(2400, 1600)
  end

  it 'changes nothing on a dry run' do
    run_task(dry_run: true)

    expect(layout_image.reload.image).to have_dimensions(3000, 2000)
  end
end
# rubocop:enable RSpec/DescribeClass
