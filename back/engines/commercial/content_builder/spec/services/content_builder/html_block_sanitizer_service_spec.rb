# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::HtmlBlockSanitizerService do
  let(:service) { described_class.new }

  describe 'sanitize' do
    it 'allows paragraphs and breaks to pass through' do
      input = <<~HTML
        <p>paragraph<br>with<br>breaks</p>
      HTML
      expect(service.sanitize(input)).to eq input
    end

    it 'allows video audio source iframe tags with their specific attributes to pass through' do
      input = <<~HTML
        <video controls width="250"><source src="film.mp4" type="film/mp4" />
        <audio controls src="listen.mp3"></audio>
        <iframe src="https://example.com" frameborder="0" allowfullscreen></iframe>
        
      HTML
      expect(service.sanitize(input)).to include('video')
      expect(service.sanitize(input)).to include('controls').twice
      expect(service.sanitize(input)).to include('source')
      expect(service.sanitize(input)).to include('src').exactly(3).times
      expect(service.sanitize(input)).to include('type')
      expect(service.sanitize(input)).to include('audio').twice
      expect(service.sanitize(input)).to include('iframe').twice
      expect(service.sanitize(input)).to include('frameborder')
      expect(service.sanitize(input)).to include('allowfullscreen')
    end

    it 'allows img tag to pass through but disallows onerror attribute' do
      input = <<~HTML
        <img src="image.jpg" alt="image" onerror="alert('XSS')">
      HTML
      expect(service.sanitize(input)).to include('img')
      expect(service.sanitize(input)).to include('src')
      expect(service.sanitize(input)).to include('alt')
      expect(service.sanitize(input)).not_to include('onerror')
    end

    it 'disallows form input button select textarea fieldset tags' do
      input = <<~HTML
        <form action="/submit" method="post">
          <input type="text" name="name" />
          <button type="submit"></button>
          <select name="options">
          </select>
          <textarea name="message"></textarea>
          <fieldset>
            <input type="checkbox" name="checkbox" />
          </fieldset>
        </form>
      HTML
      expect(service.sanitize(input)).to eq ''
    end
  end
end
