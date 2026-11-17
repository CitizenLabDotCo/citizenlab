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

  describe '.prepare_uploads!' do
    let(:blob) { 'https://decidim.example/rails/active_storage/blobs/redirect/abc' }
    let(:assemblies_folder) do
      { 'title_multiloc' => { 'fr-FR' => DecidimImporter::ExportReader::ASSEMBLIES_FOLDER_TITLE },
        'admin_publication_attributes' => { 'publication_status' => 'published' } }
    end
    let(:process) { { 'title_multiloc' => { 'fr-FR' => 'Entre en gare' }, 'slug' => 'entre-en-gare' } }
    let(:assembly) do
      { 'title_multiloc' => { 'fr-FR' => 'Conseil' }, 'slug' => 'conseil',
        'admin_publication_attributes' => { 'parent_attributes_ref' => assemblies_folder['admin_publication_attributes'] } }
    end

    before { allow(described_class).to receive(:image_prune_reason).and_return('it could not be found') }

    it 'returns each dropped upload with its source url and the Decidim page of its project' do
      file = { 'name' => 'etude.pdf', 'remote_content_url' => "#{blob}/etude.pdf" }
      idea = { 'title_multiloc' => { 'fr-FR' => 'Plus de vélos' }, 'project_ref' => assembly }
      template = { 'models' => {
        'project_folders/folder' => [assemblies_folder],
        'project' => [process, assembly],
        'files/file' => [file],
        'files/files_project' => [{ 'file_ref' => file, 'project_ref' => process }],
        'idea' => [idea],
        'idea_image' => [{ 'idea_ref' => idea, 'remote_image_url' => "#{blob}/velo.png" }]
      } }

      dropped = described_class.prepare_uploads!(template, import_uploads: true)

      expect(dropped).to contain_exactly(
        { name: 'etude.pdf', reason: 'it could not be found', url: "#{blob}/etude.pdf",
          page: 'https://decidim.example/processes/entre-en-gare (project "Entre en gare")' },
        { name: 'remote_image_url', reason: 'it could not be found', url: "#{blob}/velo.png",
          page: 'https://decidim.example/assemblies/conseil (project "Conseil", idea "Plus de vélos")' }
      )
    end

    it 'reports embedded images too, with the page of the record holding them' do
      template = { 'models' => {
        'project' => [process],
        'static_page' => [{ 'project_ref' => process, 'top_info_multiloc' => {
          'fr-FR' => %(<img src="#{blob}/plan.png"><img src="/rails/plan.png">)
        } }]
      } }

      dropped = described_class.prepare_uploads!(template, import_uploads: true)

      expect(dropped.pluck(:reason)).to eq(['it could not be found', 'its source is not an http(s) URL'])
      # A relative src doesn't name the Decidim host, so its page path has none either.
      expect(dropped.pluck(:page)).to eq([
        'https://decidim.example/processes/entre-en-gare (project "Entre en gare")',
        '/processes/entre-en-gare (project "Entre en gare")'
      ])
    end

    it 'reports nothing when fetching is off' do
      template = { 'models' => { 'project' => [process.merge('remote_header_bg_url' => "#{blob}/hero.png")] } }

      expect(described_class.prepare_uploads!(template, import_uploads: false)).to eq([])
    end
  end

  describe '.prune_oversized_files!' do
    let(:limit) { Files::FileUploader.new.size_range.max }
    let(:project) { { 'title_multiloc' => { 'fr-FR' => 'Entre en gare' }, 'slug' => 'entre-en-gare' } }
    let(:blob) { 'https://decidim.example/rails/active_storage/blobs/redirect/abc' }

    def file(name, id)
      { 'id' => id, 'name' => name, 'remote_content_url' => "#{blob}/#{name}" }
    end

    it 'drops a file over the upload limit with its join and layout node, and reports it' do
      big = file('etude.pdf', 'f-big')
      small = file('avis.pdf', 'f-small')
      craftjs = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[file0 file1] },
        'file0' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-big' } },
        'file1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-small' } }
      }
      template = { 'models' => {
        'project' => [project],
        'files/file' => [big, small],
        'files/files_project' => [{ 'file_ref' => big, 'project_ref' => project },
          { 'file_ref' => small, 'project_ref' => project }],
        'content_builder/layout' => [{ 'craftjs_json' => craftjs, 'content_buildable_ref' => project }]
      } }
      allow(described_class).to receive(:probe_image).with("#{blob}/etude.pdf").and_return([true, '', limit + 1])
      allow(described_class).to receive(:probe_image).with("#{blob}/avis.pdf").and_return([true, '', limit])

      dropped = described_class.prune_oversized_files!(template)

      expect(template['models']['files/file']).to eq([small])
      expect(template['models']['files/files_project'].map { |join| join['file_ref'] }).to eq([small])
      expect(craftjs.keys).to contain_exactly('ROOT', 'file1')
      expect(dropped).to eq([{
        name: 'etude.pdf', reason: "it is larger than the #{limit / 1.megabyte} MB upload limit",
        url: "#{blob}/etude.pdf", page: 'https://decidim.example/processes/entre-en-gare (project "Entre en gare")'
      }])
    end

    it 'keeps a file whose size the probe could not read' do
      unknown = file('plan.pdf', 'f-unknown')
      template = { 'models' => { 'files/file' => [unknown] } }
      allow(described_class).to receive(:probe_image).and_return([false, ''])

      expect(described_class.prune_oversized_files!(template)).to eq([])
      expect(template['models']['files/file']).to eq([unknown])
    end

    it 'is a no-op when the template has no files' do
      expect(described_class.prune_oversized_files!({ 'models' => {} })).to eq([])
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

  describe '.prune_imageless_images!' do
    it 'drops project and idea images whose image url was stripped/pruned, keeping the rest' do
      template = { 'models' => {
        'project_image' => [
          { 'ordering' => 0, 'remote_image_url' => 'http://x/hero.png' },
          { 'ordering' => 0 } # its image URL was stripped/pruned
        ],
        'idea_image' => [
          { 'ordering' => 0, 'remote_image_url' => 'http://x/photo.jpg' },
          { 'ordering' => 0 }
        ]
      } }

      described_class.prune_imageless_images!(template)

      expect(template['models']['project_image'].map { |i| i['remote_image_url'] }).to eq(['http://x/hero.png'])
      expect(template['models']['idea_image'].map { |i| i['remote_image_url'] }).to eq(['http://x/photo.jpg'])
    end

    it 'is a no-op when the template has no images' do
      expect { described_class.prune_imageless_images!({ 'models' => {} }) }.not_to raise_error
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

    context 'with a max_size' do
      using RSpec::Parameterized::TableSyntax

      where(:status, :headers, :body, :expected) do
        206 | { 'Content-Range' => 'bytes 0-31/3000000' } | '%PDF' | 'it is larger than the 2 MB upload limit'
        206 | { 'Content-Range' => 'bytes 0-31/1000' }    | '%PDF' | nil
        206 | {}                                          | '%PDF' | nil
        200 | { 'Content-Length' => '3000000' }           | '%PDF' | 'it is larger than the 2 MB upload limit'
      end

      with_them do
        it 'drops a body over the limit, read from the Content-Range total or a full-body Content-Length' do
          stub_request(:get, 'https://s3.example/report.pdf').to_return(status: status, headers: headers, body: body)

          expect(described_class.image_prune_reason('https://s3.example/report.pdf', max_size: 2.megabytes))
            .to eq(expected)
        end
      end
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

      it 'probes file content against the file uploader size limit, and drops and logs a file over it' do
        allow(Rails.logger).to receive(:warn)
        allow(described_class).to receive(:image_prune_reason)
          .with('https://x/plan-guide.pdf', max_size: Files::FileUploader.new.size_range.max)
          .and_return('it is larger than the 100 MB upload limit')
        template = { 'models' => { 'files/file' => [
          { 'name' => 'plan-guide.pdf', 'remote_content_url' => 'https://x/plan-guide.pdf' }
        ] } }

        described_class.prune_unreachable_remote_urls!(template)

        expect(template['models']['files/file'].first).not_to have_key('remote_content_url')
        expect(Rails.logger).to have_received(:warn).with(/plan-guide\.pdf.*larger than the 100 MB upload limit/)
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
