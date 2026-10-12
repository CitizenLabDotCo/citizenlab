# frozen_string_literal: true

require 'rails_helper'
require 'carrierwave/test/matchers'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:reprocess_large_images rake task' do
  include CarrierWave::Test::Matchers

  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:reprocess_large_images'].reenable
    FileUtils.rm_f(Rails.root.join('reprocess_large_images.json'))
    FileUtils.rm_f(Rails.root.join('reprocess_large_images_dry_run.json'))
    FileUtils.rm_rf(tmp_dir)
  end

  let(:tmp_dir) { Dir.mktmpdir }
  let!(:layout_image) { create(:layout_image, image: large_image) }
  let!(:text_image) { create(:text_image, image: large_image) }

  # Stored without processing, like the images uploaded before they were shrunk.
  def large_image
    path = File.join(tmp_dir, 'photo.jpg')
    MiniMagick::Tool::Convert.new { |convert| convert << '-size' << '3000x2000' << 'xc:red' << path }
    File.open(path)
  end

  def run_task(dry_run: false)
    [ContentBuilder::LayoutImageUploader, TextImageUploader].each { _1.enable_processing = true }
    Rake::Task['single_use:reprocess_large_images'].invoke(dry_run ? nil : 'execute', nil)
  ensure
    [ContentBuilder::LayoutImageUploader, TextImageUploader].each { _1.enable_processing = false }
  end

  def report(dry_run: false)
    JSON.parse(Rails.root.join("reprocess_large_images#{'_dry_run' if dry_run}.json").read)
  end

  it 'shrinks layout and text images under the same file name' do
    identifiers = [layout_image, text_image].map { _1.read_attribute(:image) }

    run_task

    [layout_image, text_image].each(&:reload)
    expect([layout_image, text_image].map { _1.read_attribute(:image) }).to eq identifiers
    expect(layout_image.image).to have_dimensions(2400, 1600)
    expect(text_image.image).to have_dimensions(2400, 1600)
  end

  it 'changes nothing on a dry run' do
    run_task(dry_run: true)

    expect(layout_image.reload.image).to have_dimensions(3000, 2000)
    expect(text_image.reload.image).to have_dimensions(3000, 2000)
  end

  it 'reports only the images that will shrink' do
    create(:layout_image)
    create(:text_image)

    run_task(dry_run: true)

    expect(report(dry_run: true)['changes'].pluck('new_value')).to contain_exactly(
      layout_image.read_attribute(:image), text_image.read_attribute(:image)
    )
  end

  it 'removes the tempfiles it reads image sizes from' do
    tempfiles = -> { Dir.glob(File.join(MiniMagick.tmpdir, 'mini_magick*')) }
    existing = tempfiles.call

    run_task(dry_run: true)

    expect(tempfiles.call - existing).to be_empty
  end

  it 'skips an image still being copied from another project' do
    layout_image.update_column(:image, 'https://example.com/uploads/photo.jpg')
    text_image.update_column(:image, 'https://example.com/uploads/photo.jpg')

    run_task

    expect(report['changes']).to be_empty
    expect(report['errors']).to be_empty
  end
end
# rubocop:enable RSpec/DescribeClass
