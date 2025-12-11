# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::FileAttachmentProcessorService do
  subject(:service) { described_class.new(layout) }

  let(:layout) { create(:layout, craftjs_json: craftjs_json) }
  let(:file) { create(:file) }

  describe '#process_file_attachments' do
    context 'with a FileAttachment widget' do
      let(:craftjs_json) do
        {
          'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
          'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
        }
      end

      it 'creates a file attachment and injects the ID into craftjs_json' do
        result = service.process_file_attachments
        
        expect(Files::FileAttachment.where(attachable: layout, file: file).count).to eq(1)
        expect(result['node1']['props']['fileAttachmentId']).to be_present
      end
    end

    context 'with orphaned file attachments' do
      let(:another_file) { create(:file) }
      let!(:orphaned_attachment) { create(:file_attachment, file: another_file, attachable: layout) }
      let(:craftjs_json) do
        {
          'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
          'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
        }
      end

      it 'deletes attachments not referenced in the JSON' do
        service.process_file_attachments
        expect(Files::FileAttachment.exists?(orphaned_attachment.id)).to be false
      end
    end
  end
end
