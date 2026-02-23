# frozen_string_literal: true

module BulkImportIdeas
  class FormsyncBenchmarkService
    BENCHMARKS_DIR = Rails.root.join('tmp', 'formsync_benchmarks')

    def list(locale: nil)
      return [] unless BENCHMARKS_DIR.exist?

      locales = if locale.present?
        [locale]
      else
        BENCHMARKS_DIR.children.select(&:directory?).map { |d| d.basename.to_s }
      end

      benchmarks = locales.flat_map do |loc|
        locale_dir = BENCHMARKS_DIR.join(loc)
        next [] unless locale_dir.exist?

        locale_dir.children.select(&:directory?).filter_map do |dir|
          benchmark_path = dir.join('benchmark.json')
          next unless benchmark_path.exist?

          data = JSON.parse(benchmark_path.read)
          {
            id: dir.basename.to_s,
            name: data['name'],
            locale: data['locale'],
            created_at: data['created_at'],
            question_count: data['question_count'],
            question_types: data['question_types'],
            page_count: data['page_count']
          }
        end
      end

      benchmarks.sort_by { |b| b[:created_at] }.reverse
    end

    def find(id, locale)
      dir = benchmark_dir(locale, id)
      return nil unless dir.exist?

      data = JSON.parse(dir.join('benchmark.json').read)

      pdf_binary = dir.join('scan.pdf').read
      pdf_base64 = "data:application/pdf;base64,#{Base64.strict_encode64(pdf_binary)}"

      {
        id: id,
        name: data['name'],
        locale: data['locale'],
        ground_truth: data['ground_truth'],
        pdf_base64: pdf_base64,
        created_at: data['created_at'],
        question_count: data['question_count'],
        question_types: data['question_types'],
        page_count: data['page_count']
      }
    end

    def create(name:, locale:, ground_truth:, pdf_base64:)
      slug = generate_slug(name)
      dir = benchmark_dir(locale, slug)
      FileUtils.mkdir_p(dir)

      # Decode and write PDF
      pdf_data = pdf_base64.sub(%r{^data:application/pdf;base64,}, '')
      pdf_binary = Base64.decode64(pdf_data)
      dir.join('scan.pdf').binwrite(pdf_binary)

      # Count PDF pages
      page_count = ::CombinePDF.parse(pdf_binary).pages.count

      # Write combined benchmark file
      parsed = ground_truth.is_a?(String) ? JSON.parse(ground_truth) : ground_truth
      question_types = parsed.map { |q| q['type'] }.compact.uniq

      benchmark_data = {
        name: name,
        locale: locale,
        created_at: Time.current.iso8601,
        question_count: parsed.size,
        question_types: question_types,
        page_count: page_count,
        ground_truth: parsed
      }
      dir.join('benchmark.json').write(JSON.pretty_generate(benchmark_data))

      { id: slug, **benchmark_data.except(:ground_truth) }
    end

    def destroy(id, locale)
      dir = benchmark_dir(locale, id)
      FileUtils.rm_rf(dir) if dir.exist?
    end

    private

    def benchmark_dir(locale, id)
      BENCHMARKS_DIR.join(locale.to_s, id.to_s)
    end

    def generate_slug(name)
      "#{name.parameterize}-#{Time.now.to_i}"
    end
  end
end
