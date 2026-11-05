# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::TemplateCleaner do
  describe '.strip_embedded_images!' do
    it 'removes <img> tags from rich-text multilocs but keeps the surrounding text' do
      template = { 'models' => { 'idea' => [{
        'body_multiloc' => { 'fr-FR' => '<p>Avant</p><img src="http://dead/x.png" alt="x"><p>Après</p>' },
        'title_multiloc' => { 'fr-FR' => 'Titre' }
      }] } }

      described_class.strip_embedded_images!(template)

      body = template['models']['idea'].first['body_multiloc']['fr-FR']
      expect(body).to eq('<p>Avant</p><p>Après</p>')
      expect(template['models']['idea'].first['title_multiloc']['fr-FR']).to eq('Titre')
    end
  end

  describe '.prune_unreachable_embedded_images!' do
    it 'drops only the embedded images whose source is unreachable, keeping the rest and the text' do
      allow(described_class).to receive(:image_prune_reason).with('http://live/ok.png').and_return(nil)
      allow(described_class).to receive(:image_prune_reason).with('http://dead/gone.png').and_return('it could not be found')
      template = { 'models' => { 'idea' => [{
        'body_multiloc' => { 'fr-FR' => '<p>A</p><img src="http://live/ok.png"><img src="http://dead/gone.png"><p>B</p>' }
      }] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR'])
        .to eq('<p>A</p><img src="http://live/ok.png"><p>B</p>')
    end

    it 'leaves base64 images untouched and probes each distinct url only once' do
      allow(described_class).to receive(:image_prune_reason).and_return(nil)
      template = { 'models' => { 'idea' => [
        { 'body_multiloc' => { 'fr-FR' => '<img src="http://x/a.png"><img src="data:image/png;base64,AAAA">' } },
        { 'body_multiloc' => { 'en' => '<img src="http://x/a.png">' } }
      ] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR']).to include('data:image/png;base64,AAAA')
      expect(described_class).to have_received(:image_prune_reason).once # memoised across records/locales
    end

    it 'drops a non-fetchable (root-relative) img but keeps a reachable absolute one and inline data' do
      html = '<img src="/rails/x.png"> <img src="https://ok.fr/y.png"> <img src="data:image/png;base64,AAA">'
      template = { 'models' => { 'phase' => [{ 'description_multiloc' => { 'fr-FR' => html } }] } }

      # Pre-seed reachability so no real HTTP request is made for the absolute src.
      described_class.prune_unreachable_embedded_images!(template, { 'https://ok.fr/y.png' => nil })

      result = template['models']['phase'][0]['description_multiloc']['fr-FR']
      expect(result).not_to include('/rails/x.png') # non-fetchable → dropped
      expect(result).to include('src="https://ok.fr/y.png"') # reachable → kept
      expect(result).to include('data:image/png;base64,AAA') # inline → kept
    end
  end

  describe '.prune_fileless_attachments!' do
    it 'drops content-less files and their dependent join/attachment records, keeping the rest' do
      kept = { 'name' => 'kept.pdf', 'remote_content_url' => 'http://x/y.pdf' }
      gone = { 'name' => 'gone.pdf' } # its content URL was stripped/pruned
      template = { 'models' => {
        'files/file' => [kept, gone],
        'files/files_project' => [{ 'file_ref' => kept }, { 'file_ref' => gone }],
        'files/file_attachment' => [{ 'file_ref' => kept }, { 'file_ref' => gone }]
      } }

      described_class.prune_fileless_attachments!(template)

      expect(template['models']['files/file'].map { |f| f['name'] }).to eq(['kept.pdf'])
      expect(template['models']['files/files_project'].map { |fp| fp['file_ref'] }).to eq([kept])
      expect(template['models']['files/file_attachment'].map { |fa| fa['file_ref'] }).to eq([kept])
    end

    it 'is a no-op when the template has no files' do
      expect { described_class.prune_fileless_attachments!({ 'models' => {} }) }.not_to raise_error
    end

    it 'strips the FileAttachment craft node of a pruned file from the project-description layout' do
      gone = { 'id' => 'f-gone', 'name' => 'gone.pdf' } # content URL was stripped/pruned
      kept = { 'id' => 'f-kept', 'name' => 'kept.pdf', 'remote_content_url' => 'http://x/k.pdf' }
      craftjs = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[file0 file1] },
        'file0' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-gone' } },
        'file1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-kept' } }
      }
      template = { 'models' => {
        'files/file' => [gone, kept],
        'content_builder/layout' => [{ 'craftjs_json' => craftjs }]
      } }

      described_class.prune_fileless_attachments!(template)

      expect(craftjs).not_to have_key('file0')
      expect(craftjs).to have_key('file1')
      expect(craftjs['ROOT']['nodes']).to eq(['file1'])
    end
  end

  describe '.prune_imageless_project_images!' do
    it 'drops project images whose image url was stripped/pruned, keeping the rest' do
      template = { 'models' => { 'project_image' => [
        { 'ordering' => 0, 'remote_image_url' => 'http://x/hero.png' },
        { 'ordering' => 0 } # its image URL was stripped/pruned
      ] } }

      described_class.prune_imageless_project_images!(template)

      expect(template['models']['project_image'].map { |i| i['remote_image_url'] }).to eq(['http://x/hero.png'])
    end

    it 'is a no-op when the template has no project images' do
      expect { described_class.prune_imageless_project_images!({ 'models' => {} }) }.not_to raise_error
    end
  end

  describe '.image_prune_reason' do
    # PNG / JPEG magic bytes for sniffing the real content type.
    let(:png_bytes) { "\x89PNG\r\n\x1a\n\x00\x00\x00\x0DIHDR".b }
    let(:jpeg_bytes) { "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01".b }

    it 'is reachable via a ranged GET even when HEAD is forbidden (presigned S3 URL)' do
      # Active Storage redirects to presigned S3 URLs signed for GET only: HEAD → 403, GET → 200.
      stub_request(:head, 'https://s3.example/file.pdf').to_return(status: 403)
      stub_request(:get, 'https://s3.example/file.pdf').to_return(status: 200)

      expect(described_class.image_prune_reason('https://s3.example/file.pdf')).to be_nil
    end

    it 'follows redirects to the underlying blob (206 Partial Content counts as reachable)' do
      stub_request(:get, 'https://app.example/redirect/file.pdf')
        .to_return(status: 302, headers: { 'Location' => 'https://s3.example/blob.pdf' })
      stub_request(:get, 'https://s3.example/blob.pdf').to_return(status: 206)

      expect(described_class.image_prune_reason('https://app.example/redirect/file.pdf')).to be_nil
    end

    it 'reports a genuinely missing file as not found' do
      stub_request(:get, 'https://s3.example/gone.pdf').to_return(status: 404)

      expect(described_class.image_prune_reason('https://s3.example/gone.pdf')).to eq('it could not be found')
    end

    it 'keeps an image whose content matches its extension' do
      stub_request(:get, 'https://s3.example/logo.png').to_return(status: 200, body: png_bytes)

      expect(described_class.image_prune_reason('https://s3.example/logo.png')).to be_nil
    end

    it 'reports a reachable image whose content type disagrees with its extension as a conflict (JPEG named .png)' do
      # This is exactly what aborts the import at exif-stripping time, so it must be pruned beforehand — but
      # for a different reason than an unreachable one, which the log must keep apart.
      stub_request(:get, 'https://s3.example/logo.png').to_return(status: 200, body: jpeg_bytes)

      expect(described_class.image_prune_reason('https://s3.example/logo.png'))
        .to eq('its content conflicts with its extension')
    end

    it 'treats .jpg and .jpeg as the same format (no false conflict)' do
      stub_request(:get, 'https://s3.example/photo.jpg').to_return(status: 200, body: jpeg_bytes)

      expect(described_class.image_prune_reason('https://s3.example/photo.jpg')).to be_nil
    end
  end

  describe '.prune_unreachable_remote_urls!' do
    it 'drops only the remote_*_url attachments that are unreachable' do
      allow(described_class).to receive(:image_prune_reason).with('http://live/a.png').and_return(nil)
      allow(described_class).to receive(:image_prune_reason).with('http://dead/b.png').and_return('it could not be found')
      template = { 'models' => {
        'user' => [{ 'email' => 'a@b.co', 'remote_avatar_url' => 'http://dead/b.png' }],
        'project' => [{ 'remote_header_bg_url' => 'http://live/a.png' }]
      } }

      described_class.prune_unreachable_remote_urls!(template)

      expect(template['models']['user'].first).not_to have_key('remote_avatar_url')
      expect(template['models']['project'].first['remote_header_bg_url']).to eq('http://live/a.png')
    end

    it 'logs a not-found attachment distinctly from one dropped for a format conflict' do
      allow(Rails.logger).to receive(:warn)
      allow(described_class).to receive(:image_prune_reason)
        .with('http://dead/gone.png').and_return('it could not be found')
      allow(described_class).to receive(:image_prune_reason)
        .with('http://x/mislabelled.png').and_return('its content conflicts with its extension')
      template = { 'models' => { 'project_image' => [
        { 'remote_image_url' => 'http://dead/gone.png' },
        { 'remote_image_url' => 'http://x/mislabelled.png' }
      ] } }

      described_class.prune_unreachable_remote_urls!(template)

      expect(Rails.logger).to have_received(:warn).with(%r{could not be found.*http://dead/gone\.png})
      expect(Rails.logger).to have_received(:warn).with(%r{conflicts with its extension.*http://x/mislabelled\.png})
    end

    context 'with a file whose extension is not on the upload allowlist' do
      # Decidim serves attachments in formats Go Vocal won't store (here a Windows metafile). CarrierWave
      # rejects them on save and the deserializer re-raises, aborting the whole import — so drop them here.
      let(:emf_url) { 'https://participez.example/rails/active_storage/blobs/redirect/abc/Nicolas%20Garnier.emf' }

      it 'drops the content url without probing the network' do
        expect(described_class).not_to receive(:image_prune_reason)
        template = { 'models' => { 'files/file' => [
          { 'name' => 'Nicolas Garnier.emf', 'remote_content_url' => emf_url }
        ] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(template['models']['files/file'].first).not_to have_key('remote_content_url')
      end

      it 'logs the file it dropped, naming the offending extension' do
        allow(Rails.logger).to receive(:warn)
        template = { 'models' => { 'files/file' => [
          { 'name' => 'Nicolas Garnier.emf', 'remote_content_url' => emf_url }
        ] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(Rails.logger).to have_received(:warn)
          .with(/Nicolas Garnier\.emf.*\.emf is not on the upload allowlist/)
      end

      it 'keeps files whose extension is allowlisted and reachable' do
        allow(described_class).to receive(:image_prune_reason).and_return(nil)
        template = { 'models' => { 'files/file' => [
          { 'name' => 'rapport.pdf', 'remote_content_url' => 'https://x/rapport.pdf' },
          { 'name' => 'plan.DOCX', 'remote_content_url' => 'https://x/plan.DOCX' }
        ] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(template['models']['files/file'].map { |f| f['remote_content_url'] })
          .to eq(['https://x/rapport.pdf', 'https://x/plan.DOCX'])
      end

      it 'drops a content url that has no extension at all' do
        allow(described_class).to receive(:image_prune_reason).and_return(nil)
        template = { 'models' => { 'files/file' => [
          { 'name' => 'mystery', 'remote_content_url' => 'https://x/blobs/redirect/abc' }
        ] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(template['models']['files/file'].first).not_to have_key('remote_content_url')
      end

      it 'leaves non-file uploads to the reachability check, whatever their extension' do
        # `remote_content_url` is the only upload going through the file allowlist; an image with an odd
        # extension is still governed by whether it is fetchable and self-consistent.
        allow(described_class).to receive(:image_prune_reason).with('https://x/hero.emf').and_return(nil)
        template = { 'models' => { 'project_image' => [{ 'remote_image_url' => 'https://x/hero.emf' }] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(template['models']['project_image'].first['remote_image_url']).to eq('https://x/hero.emf')
      end

      it 'leaves the file record itself to be swept up by .prune_fileless_attachments!' do
        # The end-to-end contract: the disallowed file, its ownership join and its layout node all go,
        # exactly as they would for an unreachable one — which is what keeps the import alive.
        emf = { 'id' => 'f-emf', 'name' => 'Nicolas Garnier.emf', 'remote_content_url' => emf_url }
        pdf = { 'id' => 'f-pdf', 'name' => 'rapport.pdf', 'remote_content_url' => 'https://x/rapport.pdf' }
        allow(described_class).to receive(:image_prune_reason).and_return(nil)
        craftjs = {
          'ROOT' => { 'type' => 'div', 'nodes' => %w[file0 file1] },
          'file0' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-emf' } },
          'file1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-pdf' } }
        }
        template = { 'models' => {
          'files/file' => [emf, pdf],
          'files/files_project' => [{ 'file_ref' => emf }, { 'file_ref' => pdf }],
          'content_builder/layout' => [{ 'craftjs_json' => craftjs }]
        } }

        described_class.prune_unreachable_remote_urls!(template)
        described_class.prune_fileless_attachments!(template)

        expect(template['models']['files/file'].map { |f| f['name'] }).to eq(['rapport.pdf'])
        expect(template['models']['files/files_project'].map { |fp| fp['file_ref'] }).to eq([pdf])
        expect(craftjs).not_to have_key('file0')
        expect(craftjs['ROOT']['nodes']).to eq(['file1'])
      end
    end
  end
end
