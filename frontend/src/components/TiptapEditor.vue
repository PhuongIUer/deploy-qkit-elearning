<template>
  <div class="editor-wrapper">
    <div class="toolbar" v-if="editor">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><strong>B</strong></button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><em>I</em></button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }"><u>U</u></button>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor.isActive('heading', { level: 1 }) }">H1</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }">
        <font-awesome-icon :icon="faStrikethrough" />
      </button>
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">
        <font-awesome-icon :icon="faListUl" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('left').run()">
        <font-awesome-icon :icon="faAlignLeft" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()">
        <font-awesome-icon :icon="faAlignCenter" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()">
        <font-awesome-icon :icon="faAlignRight" />
      </button>
    </div>
    <EditorContent v-if="editor" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { onBeforeUnmount } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAlignCenter, faAlignLeft, faAlignRight, faListUl, faStrikethrough } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  editorProps: {
    attributes: {
      class: 'my-custom-editor'
    }
  },
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Enter your Description',
      emptyEditorClass: 'is-editor-empty'
    }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML());
  }
})

onBeforeUnmount(() => {
  editor?.value?.destroy()
})
</script>

<style scoped>
.editor-wrapper {
  border: 1px solid #6c9d8f;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  padding: 8px;
  position: relative;

}

.toolbar {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.toolbar button, .toolbar select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.toolbar button.active {
  background-color: #eee;
  font-weight: bold;
}

.ProseMirror {
  min-height: 200px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.5;
  box-sizing: border-box;
  background-color: #fff;
  overflow-y: auto;
}

.ProseMirror p.is-empty:first-child::before {
  content: attr(data-placeholder);
  position: absolute;
  color: #aaa;
  pointer-events: none;
}

.ProseMirror p.is-empty {
  position: relative;
}


</style>
