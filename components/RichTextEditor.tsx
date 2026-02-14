'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''}`}
                title="Bold"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700 italic' : ''}`}
                title="Italic"
            >
                I
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('strike') ? 'bg-gray-100 dark:bg-gray-700 line-through' : ''}`}
                title="Strike"
            >
                S
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''}`}
                title="H1"
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''}`}
                title="H2"
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 dark:bg-gray-700 font-bold' : ''}`}
                title="H3"
            >
                H3
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                title="Bullet List"
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                title="Ordered List"
            >
                1. List
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
            <button
                type="button"
                onClick={setLink}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                title="Link"
            >
                Link
            </button>
            <button
                type="button"
                onClick={addImage}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Image"
            >
                Image
            </button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, editable = true }: RichTextEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if content is completely different to avoid cursor jumping
            // This is a naive check, for production might need better diffing
            if (editor.getText() === '' && content !== '') {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);


    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
