'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import {
  Bold, Italic, UnderlineIcon, AlignRight, AlignCenter, AlignLeft,
  List, ListOrdered, Quote, Link2, Image as ImageIcon,
  Heading1, Heading2, Undo, Redo
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const ToolbarButton = ({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

export default function TipTapEditor({ content, onChange, onImageUpload }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[300px] text-gray-200',
        'data-placeholder': 'اكتب محتوى الخبر هنا...',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('أدخل رابط URL:');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = async () => {
    if (onImageUpload) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          // Process all selected files
          for (const file of Array.from(files)) {
            try {
              const url = await onImageUpload(file);
              editor.chain().focus().setImage({ src: url }).run();
            } catch (err) {
              console.error('Image upload failed', err);
            }
          }
        }
      };
      input.click();
    } else {
      const url = prompt('أدخل رابط الصورة:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700 bg-gray-850">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="غامق">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="مائل">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="تسطير">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="عنوان 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="عنوان 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="محاذاة يمين">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="توسيط">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="محاذاة يسار">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="قائمة نقطية">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="قائمة مرقمة">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="اقتباس">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="رابط">
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="صورة">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-700 mx-1 mr-auto" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="تراجع">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="إعادة">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      {/* Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
