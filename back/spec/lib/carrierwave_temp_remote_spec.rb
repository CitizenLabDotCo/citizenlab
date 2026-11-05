# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CarrierwaveTempRemote do
  subject(:temp_remote) { described_class }

  let(:model) { create(:project) }
  let(:remote_url) { 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/brainstorming_graphic.png' }

  describe '.save_urls' do
    it 'saves remote url to model' do
      image_assignments = { remote_header_bg_url: remote_url }
      temp_remote.save_urls(model, image_assignments)
      expect(model['header_bg']).to eq(remote_url)
    end

    it 'downloads and sets image from stored temp remote url when it finishes background job', :active_job_inline_adapter do
      image_assignments = { remote_header_bg_url: remote_url }
      temp_remote.save_urls(model, image_assignments)
      expect(model.reload['header_bg']).to match(/\A.{8}-.{4}-.{4}-.{4}-.{12}\.png\Z/)
    end

    it 'raises error if column name is not correct' do
      image_assignments = { remote_hhhhheader_bg_url: remote_url }
      expect do
        temp_remote.save_urls(model, image_assignments)
      end.to raise_error(ActiveModel::MissingAttributeError)
    end

    it 'raises error if image assignment key is not correct' do
      image_assignments = { header_bg: remote_url }
      expect do
        temp_remote.save_urls(model, image_assignments)
      end.to raise_error(ArgumentError)
    end
  end

  describe '.save_files!' do
    it 'downloads and sets image from stored temp remote url' do
      model.update_columns(header_bg: remote_url)
      model.reload # make model forget that header_bg was changed
      temp_remote.save_files!(model, [:remote_header_bg_url])
      expect(model['header_bg']).to match(/\A.{8}-.{4}-.{4}-.{4}-.{12}\.png\Z/)
    end

    it "doesn't change image column if it doesn't store url" do
      model.update_columns(header_bg: '123.png')
      model.reload # make model forget that header_bg was changed
      temp_remote.save_files!(model, [:remote_header_bg_url])
      expect(model['header_bg']).to eq('123.png')
    end
  end

  describe '.url' do
    it 'returns nil if identifier is not a url' do
      image_carrierwave_identifier = '0a4ba9cb-b51d-4b99-a36f-ddad8bc2982d.jpeg'
      expect(temp_remote.url(image_carrierwave_identifier, nil)).to be_nil
    end

    it 'returns identifier if version_name is not present' do
      expect(temp_remote.url('http://foo.com/123.png', nil)).to eq('http://foo.com/123.png')
    end

    it 'returns identifier with version_name if version_name is present' do
      expect(temp_remote.url('http://foo.com/123.png', 'small')).to eq('http://foo.com/small_123.png')
    end
  end
end
