# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutService do
  let(:service) { described_class.new }

  describe 'select_craftjs_elements_for_types' do
    it 'can deal with different combinations of hash structures' do
      content = {
        'elt1' => 'string element',
        'elt2' => { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        'elt3' => { 'type' => 'div', 'props' => 'elt3-props' },
        'elt4' => { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      }
      images = service.select_craftjs_elements_for_types content, %w[Image ImageMultiloc]
      expect(images).to eq [
        { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      ]
    end
  end
end
