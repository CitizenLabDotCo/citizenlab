# frozen_string_literal: true

module ContentBuilder
  # Server half of the custom block authoring loop.
  #
  # The server owns the transcript, the system prompt and the model call; the
  # admin's browser executes the tools (compile, lint, preview, data samples)
  # and posts the results back. Talks to Claude on AWS Bedrock through the
  # Converse API, which returns tool calls without executing them - exactly
  # what a client-executed tool loop needs.
  class CustomBlockAuthoringService
    class TranscriptTooLongError < StandardError; end

    # Must fit a full set_source tool call (the whole TSX file) in one reply,
    # or the loop degenerates into truncated-rewrite cycles.
    MAX_OUTPUT_TOKENS = 16_384
    MAX_TRANSCRIPT_MESSAGES = 120

    TOOLS = [
      {
        tool_spec: {
          name: 'set_source',
          description: 'Replace the full content of block.tsx. The client compiles, ' \
                       'lint-checks and live-renders it, and returns all diagnostics. ' \
                       'Always send the complete file, never a fragment.',
          input_schema: {
            json: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'Complete TSX source of block.tsx' }
              },
              required: ['source']
            }
          }
        }
      },
      {
        tool_spec: {
          name: 'set_title',
          description: 'Set the block name that admins see in the builder toolbox. ' \
                       'Short and descriptive (2-4 words), with a value for every ' \
                       'platform locale.',
          input_schema: {
            json: {
              type: 'object',
              properties: {
                title: {
                  type: 'object',
                  description: 'Locale to name, e.g. {"en": "Before/after slider"}'
                }
              },
              required: ['title']
            }
          }
        }
      },
      {
        tool_spec: {
          name: 'set_manifest',
          description: 'Replace the block manifest. Shape: { manifest_version: 1, ' \
                       "sdk_version: 1, targets: ['homepage'], data_uses: [names of " \
                       'gv-sdk data hooks the block calls], config_schema: [fields ' \
                       'that admins can configure per placed instance] }.',
          input_schema: {
            json: {
              type: 'object',
              properties: {
                manifest: { type: 'object', description: 'The complete manifest object' }
              },
              required: ['manifest']
            }
          }
        }
      },
      {
        tool_spec: {
          name: 'set_messages',
          description: 'Replace the message catalogs used by msg(). Shape: ' \
                       '{ "<locale>": { "<message_id>": "<text>" } } with a catalog ' \
                       'for every platform locale.',
          input_schema: {
            json: {
              type: 'object',
              properties: {
                messages: { type: 'object', description: 'Catalogs per locale' }
              },
              required: ['messages']
            }
          }
        }
      },
      {
        tool_spec: {
          name: 'get_data_sample',
          description: 'Fetch a trimmed sample of real platform data for one of the ' \
                       'gv-sdk data hooks (useProjectsMini, useAuthUser, ' \
                       'useAppConfiguration), so you can see the exact response shape ' \
                       'before writing code against it.',
          input_schema: {
            json: {
              type: 'object',
              properties: {
                hook: { type: 'string', description: 'The gv-sdk hook name' }
              },
              required: ['hook']
            }
          }
        }
      }
    ].freeze

    def initialize(client: nil)
      @client = client
    end

    # Appends the incoming user message or tool results to the session
    # transcript, runs one model call, appends the assistant message, and
    # returns what the client needs to continue the loop.
    def run(session, user_message: nil, tool_results: nil)
      raise TranscriptTooLongError if session.transcript.length >= MAX_TRANSCRIPT_MESSAGES

      session.transcript << incoming_message(user_message, tool_results)

      response = client.converse(
        model_id: model_id,
        system: [{ text: system_prompt }],
        messages: api_messages(session.transcript),
        tool_config: { tools: TOOLS },
        inference_config: { max_tokens: MAX_OUTPUT_TOKENS }
      )

      assistant_message = serialize_message(response.output.message)
      session.transcript << assistant_message
      session.save!

      {
        assistant_text: extract_text(assistant_message),
        tool_calls: extract_tool_calls(assistant_message),
        stop_reason: response.stop_reason
      }
    end

    private

    def client
      @client ||= Aws::BedrockRuntime::Client.new(
        region: ENV.fetch('AWS_TOXICITY_DETECTION_REGION', 'eu-central-1')
      )
    end

    def model_id
      ENV.fetch('BEDROCK_SONNET_MODEL', 'eu.anthropic.claude-sonnet-4-6')
    end

    def incoming_message(user_message, tool_results)
      if user_message.present?
        { 'role' => 'user', 'content' => [{ 'text' => user_message }] }
      else
        {
          'role' => 'user',
          'content' => tool_results.map do |result|
            {
              'tool_result' => {
                'tool_use_id' => result[:tool_use_id],
                'content' => [{ 'text' => result[:content].to_s }],
                'status' => result[:is_error] ? 'error' : 'success'
              }
            }
          end
        }
      end
    end

    # The transcript is stored with string keys (jsonb); the AWS SDK expects
    # symbol keys for request params.
    def api_messages(transcript)
      transcript.map { |message| deep_symbolize(message) }
    end

    def deep_symbolize(value)
      case value
      when Hash
        value.each_with_object({}) do |(hash_key, hash_value), result|
          # Tool input objects keep their original (string) keys: they are
          # payload, not request-parameter names.
          result[hash_key.to_sym] = hash_key.to_s == 'input' ? hash_value : deep_symbolize(hash_value)
        end
      when Array
        value.map { |element| deep_symbolize(element) }
      else
        value
      end
    end

    def serialize_message(message)
      content = message.content.filter_map do |block|
        if block.respond_to?(:text) && block.text
          { 'text' => block.text }
        elsif block.respond_to?(:tool_use) && block.tool_use
          {
            'tool_use' => {
              'tool_use_id' => block.tool_use.tool_use_id,
              'name' => block.tool_use.name,
              'input' => block.tool_use.input.to_h
            }
          }
        end
      end

      { 'role' => 'assistant', 'content' => content }
    end

    def extract_text(assistant_message)
      texts = assistant_message['content'].filter_map { |block| block['text'] }
      texts.empty? ? nil : texts.join("\n")
    end

    def extract_tool_calls(assistant_message)
      assistant_message['content'].filter_map do |block|
        tool_use = block['tool_use']
        next unless tool_use

        { id: tool_use['tool_use_id'], name: tool_use['name'], input: tool_use['input'] }
      end
    end

    def app_config
      @app_config ||= AppConfiguration.instance
    end

    def tenant_locales
      app_config.settings('core', 'locales') || ['en']
    end

    def system_prompt
      <<~PROMPT
        You build custom page builder blocks for Go Vocal, a digital democracy platform for local governments. You work inside the platform's admin interface. The admin describes the block they want; you write it, look at the diagnostics and preview feedback, and iterate until it works.

        ## The artifact

        A block is ONE TSX file plus a manifest plus message catalogs. You write all three with the tools (set_source, set_manifest, set_messages). Rules:

        - The file default-exports a React component: `export default function Block({ config, msg }) { ... }`.
        - `config` holds the per-instance values admins set in the sidebar, following your manifest's config_schema. Always read config values defensively with fallbacks.
        - `msg(id)` returns the text for the current platform locale from your message catalogs.
        - You can ONLY import from 'gv-sdk'. No other imports, no dynamic imports.
        - Forbidden (enforced by lint): fetch/XHR/WebSocket, eval, browser storage, cookies, dangerouslySetInnerHTML, window.top/parent/open.

        ## The gv-sdk

        import { React, Box, Text, Title, Button, Icon, Spinner, colors, useAuthUser, useProjectsMini, useAppConfiguration, useLocale, useLocalize, useTheme, Link } from 'gv-sdk';

        - React: the platform's React 18. Use React.useState, React.useEffect, etc.
        - Box: layout primitive with styling props: p, px, py, m, mb, display, flex, flexDirection, flexWrap, gap, alignItems, justifyContent, background, borderRadius, width, maxWidth, minHeight. Example: `<Box display="flex" gap="16px" flexWrap="wrap">`.
        - Text: paragraph text. Props: color (token name like 'textSecondary'), fontSize ('s'|'base'|'l'), fontWeight, m.
        - Title: headings. Props: variant ('h1'..'h6'), color, m.
        - Button: props buttonStyle ('primary'|'secondary-outlined'|'text'), onClick, size.
        - Icon: props name, width, height, fill.
        - Spinner: loading indicator, no required props.
        - colors: token object (colors.teal400, colors.grey100, colors.textSecondary, ...). Prefer theme colors for branding.
        - useTheme(): styled-components theme. theme.colors.tenantPrimary and theme.colors.tenantSecondary are the tenant's brand colors.
        - useLocale(): the current locale string (e.g. 'en', 'nl-BE').
        - useLocalize(): localize(multilocObject) picks the right locale from a multiloc object like { en: '...', 'nl-BE': '...' }.
        - Link: client-side router link, `<Link to={'/projects/' + project.attributes.slug}>`.

        Data hooks (declare every one you use in the manifest's data_uses):
        - useAuthUser(): TanStack Query result. `const { data: authUser } = useAuthUser();` authUser is undefined while loading or for visitors; the user's attributes are at authUser.data.attributes (first_name, last_name, ...). Blocks run for signed-out visitors too: always handle the absent case.
        - useProjectsMini({ endpoint: 'with_active_participatory_phase' }): infinite query of projects open for participation. `const { data, isLoading } = useProjectsMini({ endpoint: 'with_active_participatory_phase' }); const projects = data ? data.pages.flatMap((page) => page.data) : [];` Each project: id, attributes.title_multiloc (multiloc), attributes.slug. Render a Spinner while isLoading, and a friendly empty state when there are no projects.
        - useAppConfiguration(): platform settings. data.data.attributes.settings.core holds locales and organization_name (multiloc).
        - Use get_data_sample BEFORE writing code against a hook when you are not sure of the exact shape.

        ## Internationalization (strict)

        Platform locales: #{tenant_locales.join(', ')}. Every piece of user-facing text goes through msg() with a catalog entry for EVERY locale listed above (translate them yourself). Text that admins should be able to edit per instance belongs in config_schema as a multiloc_text field instead; read it with localize(config.yourField). Never hardcode display text in the component.

        ## Manifest config_schema

        Each field: { "key": string, "type": "text"|"number"|"boolean"|"multiloc_text"|"select", "label": multiloc object (all locales), "default": optional, "options": only for select: [{ "value": string, "label": multiloc }] }. Keep it small: only what an admin plausibly wants to tweak.

        ## Working style

        1. On a new request: set_title, set_manifest, set_messages, then set_source. On iteration: only what changed.
        2. set_source returns compile errors, lint errors and runtime/render errors from the live preview. Fix them immediately and call set_source again. Do not conclude while errors remain.
        3. A tool result may report that your tool input was cut off by the output token limit. Do not retry the same content: write a more compact file (shorter markup, no long inline data, fewer repeated style props) or split the work into smaller tool calls.
        4. Match the platform look: clean, accessible, generous spacing, tenant brand colors via useTheme, rounded corners (borderRadius '3px'), no garish colors.
        5. Keep blocks small and readable (usually under 120 lines). No premature abstraction.
        6. In your text replies to the admin: one or two short sentences about what you did or need. Never paste code in the text; the admin sees the code and preview panes.

        ## Platform context

        Organization: #{app_config.settings('core', 'organization_name')&.values&.first}
        Tenant primary color: #{app_config.settings('core', 'color_main')}

        ## Example block (for tone and structure)

        import { React, Box, Title, Text, Spinner, useProjectsMini, useLocalize, useTheme, Link } from 'gv-sdk';

        export default function Block({ config, msg }) {
          const localize = useLocalize();
          const theme = useTheme();
          const { data, isLoading } = useProjectsMini({ endpoint: 'with_active_participatory_phase' });
          const projects = data ? data.pages.flatMap((page) => page.data) : [];
          const max = typeof config.maxProjects === 'number' ? config.maxProjects : 3;

          if (isLoading) return <Box display="flex" justifyContent="center" p="24px"><Spinner /></Box>;
          if (projects.length === 0) return <Text color="textSecondary">{msg('empty')}</Text>;

          return (
            <Box p="24px">
              <Title variant="h2" m="0 0 16px">{msg('title')}</Title>
              <Box display="flex" gap="16px" flexWrap="wrap">
                {projects.slice(0, max).map((project) => (
                  <Box key={project.id} p="16px" background="#fff" borderRadius="3px" flex="1 1 240px">
                    <Link to={'/projects/' + project.attributes.slug}>
                      <Text fontWeight="bold" color="tenantPrimary" m="0">
                        {localize(project.attributes.title_multiloc)}
                      </Text>
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        }
      PROMPT
    end
  end
end
