# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::FileAttachmentProcessorService do
  subject(:service) { described_class.new(layout) }

  let(:layout) { create(:layout, craftjs_json: craftjs_json) }
  let(:file) { create(:file) }

  describe '.extract_file_ids' do
    let(:craftjs_json) do
      {
        'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => %w[node1 node2] },
        'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'file-123' } },
        'node2' => { 'type' => { 'resolvedName' => 'TextMultiloc' }, 'props' => {} }
      }
    end

    it 'extracts fileIds from FileAttachment widgets' do
      result = described_class.extract_file_ids(craftjs_json)
      expect(result).to eq(['file-123'])
    end

    it 'returns empty array for blank craftjs_json' do
      expect(described_class.extract_file_ids(nil)).to eq([])
      expect(described_class.extract_file_ids({})).to eq([])
    end
  end

  describe '#sync_file_attachments' do
    context 'with a FileAttachment widget' do
      let(:craftjs_json) do
        {
          'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
          'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
        }
      end

      it 'creates a file attachment for the referenced file' do
        expect { service.sync_file_attachments }
          .to change { Files::FileAttachment.where(attachable: layout, file: file).count }
          .from(0).to(1)
      end

      it 'does not modify the craftjs_json' do
        original_json = layout.craftjs_json.deep_dup
        service.sync_file_attachments
        expect(layout.craftjs_json).to eq(original_json)
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
        service.sync_file_attachments
        expect(Files::FileAttachment.exists?(orphaned_attachment.id)).to be false
      end

      it 'keeps attachments that are referenced' do
        service.sync_file_attachments
        expect(Files::FileAttachment.where(attachable: layout, file: file).count).to eq(1)
      end
    end

    context 'with existing attachment for the same file' do
      let!(:existing_attachment) { create(:file_attachment, file: file, attachable: layout) }
      let(:craftjs_json) do
        {
          'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
          'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
        }
      end

      it 'does not create duplicate attachments' do
        expect { service.sync_file_attachments }
          .not_to(change { Files::FileAttachment.where(attachable: layout, file: file).count })
      end
    end

    context 'with blank craftjs_json' do
      let(:craftjs_json) { {} }

      it 'does nothing' do
        expect { service.sync_file_attachments }.not_to raise_error
      end
    end
  end
end
