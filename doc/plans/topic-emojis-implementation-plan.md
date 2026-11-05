# Plan: Add Emojis to Topics

## Summary

Add emoji support to topics (InputTopics) so they can be displayed consistently across all devices in the idea feed and sticky notes.

## Requirements

1. Emojis exposed by backend to frontend (icon field already exists)
2. Emojis editable via topic form in admin
3. Emojis only for root topics (depth=0), not subtopics
4. Consistent appearance across devices using Twemoji icon font
5. Emojis visible in idea feed, sticky notes, and sidebar

---

## Implementation

### Phase 1: Install Dependencies

**File:** `front/package.json`

Install two packages:

- `@emoji-mart/data` + `@emoji-mart/react` - Emoji picker for admin form
- `twemoji` - Cross-platform emoji rendering

```bash
cd front && npm install @emoji-mart/data @emoji-mart/react twemoji
```

---

### Phase 2: Create Emoji Component

**New file:** `front/app/components/UI/Emoji/index.tsx`

A reusable component that renders emojis using Twemoji (Twitter's emoji font) for consistent cross-device appearance:

- Takes an emoji character and optional size
- Converts to Twemoji SVG image via CDN
- Returns styled `<span>` with embedded `<img>`

---

### Phase 3: Create Emoji Picker Form Component

**New file:** `front/app/components/HookForm/EmojiPicker/index.tsx`

A React Hook Form compatible emoji picker:

- Button showing current emoji (or "Select emoji" placeholder)
- Opens emoji-mart picker popover on click
- Clear button to remove selection
- Follows existing ColorPicker component pattern

---

### Phase 4: Update Topic Form

**File:** `front/app/containers/Admin/projects/project/topics/InputTopicModal.tsx`

Changes:

1. Add `icon?: string | null` to `FormValues` interface
2. Detect if editing/adding a subtopic: `const isSubtopic = parentId !== undefined || (topic?.attributes.depth ?? 0) >= 1`
3. Add emoji picker field (only shown for root topics):
   ```tsx
   {
     !isSubtopic && (
       <SectionField>
         <EmojiPicker
           name="icon"
           label={formatMessage(messages.fieldTopicEmoji)}
         />
       </SectionField>
     );
   }
   ```
4. Include `icon` in form reset and submit handlers

**File:** `front/app/containers/Admin/projects/project/topics/messages.ts`

- Add `fieldTopicEmoji` message

---

### Phase 5: Display Emoji in Sticky Notes

**File:** `front/app/containers/IdeasFeedPage/StickyNotes/StickyNote.tsx`

Changes:

1. Add `topicEmoji?: string | null` to Props interface
2. Display emoji in top-right corner when present:
   ```tsx
   {
     topicEmoji && (
       <Box position="absolute" top="12px" right="12px">
         <Emoji emoji={topicEmoji} size="28px" />
       </Box>
     );
   }
   ```

**File:** `front/app/containers/IdeasFeedPage/IdeasFeed.tsx`

Changes:

1. Import `useInputTopics` hook
2. Fetch all topics for the project
3. Create emoji lookup map: `topicId -> emoji`
4. Pass `topicEmoji` prop to `<StickyNote />`

**File:** `front/app/containers/IdeasFeedPage/StickyNotes/StickyNotesPile.tsx`

Same changes as IdeasFeed.tsx to pass emoji to StickyNote components.

---

### Phase 6: Backend Validation (Optional Enhancement)

**File:** `back/app/models/input_topic.rb`

Add validation to prevent emojis on subtopics:

```ruby
validate :icon_only_for_root_topics

private

def icon_only_for_root_topics
  return if icon.blank?
  errors.add(:icon, :not_allowed_for_subtopics) if depth.present? && depth >= 1
end
```

Note: The `icon` field already exists in the schema and is already serialized/permitted by the API.

---

## Files to Modify

| File                                                                     | Action                                         |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| `front/package.json`                                                     | Add emoji-mart and twemoji dependencies        |
| `front/app/components/UI/Emoji/index.tsx`                                | **Create** - Twemoji rendering component       |
| `front/app/components/HookForm/EmojiPicker/index.tsx`                    | **Create** - Form emoji picker                 |
| `front/app/containers/Admin/projects/project/topics/InputTopicModal.tsx` | Add emoji picker to form                       |
| `front/app/containers/Admin/projects/project/topics/messages.ts`         | Add emoji field label message                  |
| `front/app/containers/IdeasFeedPage/StickyNotes/StickyNote.tsx`          | Add emoji display prop                         |
| `front/app/containers/IdeasFeedPage/IdeasFeed.tsx`                       | Fetch topics and pass emoji to StickyNote      |
| `front/app/containers/IdeasFeedPage/StickyNotes/StickyNotesPile.tsx`     | Fetch topics and pass emoji to StickyNote      |
| `front/app/containers/IdeasFeedPage/Sidebar/TopicItem.tsx`               | Add emoji display next to topic title          |
| `front/app/containers/IdeasFeedPage/Sidebar/SelectedTopicContent.tsx`    | Add emoji display next to selected topic title |
| `back/app/models/input_topic.rb`                                         | Add validation for icon only on root topics    |

---

## Verification

1. **Admin topic form**: Create/edit a topic and verify emoji picker appears (not for subtopics)
2. **Persistence**: Save emoji, refresh page, verify it persists
3. **Sticky notes**: View idea feed, verify emoji appears in top-right of sticky notes
4. **Cross-device**: Test on different browsers/devices, verify emoji looks identical (Twemoji)
5. **Subtopic restriction**: Verify emoji picker doesn't appear when adding/editing subtopics
6. **Run tests**: `cd front && npm test`
