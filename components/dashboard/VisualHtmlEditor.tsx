"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface AnchorItem {
  index: number;
  text: string;
  href: string;
}

interface Props {
  useVisualEditor: boolean;
  setUseVisualEditor: (v: boolean) => void;
  html: string;
  setHtml: (v: string) => void;
  anchors: AnchorItem[];
  onUpdateAnchor: (idx: number, text: string, href: string) => void;
}

export default function VisualHtmlEditor({
  useVisualEditor,
  setUseVisualEditor,
  html,
  setHtml,
  anchors,
  onUpdateAnchor,
}: Props) {
  const visualRef = useRef<HTMLDivElement | null>(null);

  // Keep editor DOM in sync with external html state without breaking caret during typing
  useEffect(() => {
    if (useVisualEditor && visualRef.current) {
      const isActive = document.activeElement === visualRef.current;
      if (!isActive && visualRef.current.innerHTML !== (html || "")) {
        visualRef.current.innerHTML = html || "";
      }
    }
  }, [useVisualEditor, html]);

  const applyFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (visualRef.current) setHtml(visualRef.current.innerHTML);
  };

  const insertCTA = () => {
    const text = prompt("Button text", "Call to Action");
    if (!text) return;
    const href = prompt("Button link URL", "https://");
    if (!href) return;
    const a = `<a href="${href}" style="background:#1d4ed8;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">${text}</a>`;
    document.execCommand("insertHTML", false, a);
    if (visualRef.current) setHtml(visualRef.current.innerHTML);
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const sanitizeHtml = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(visualRef.current?.innerHTML || html || "", "text/html");
      doc.querySelectorAll("script, style").forEach(n => n.remove());
      doc.body.querySelectorAll("*").forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
        });
      });
      const clean = doc.body.innerHTML;
      if (visualRef.current) visualRef.current.innerHTML = clean;
      setHtml(clean);
    } catch {}
  };

  const isEmpty = useMemo(() => {
    const tmp = (html || "").replace(/<br\s*\/?>/gi, "").replace(/&nbsp;/g, " ");
    const text = tmp.replace(/<[^>]*>/g, "").trim();
    return text.length === 0;
  }, [html]);

  const textOnly = useMemo(() => {
    const el = document.createElement('div');
    el.innerHTML = html || '';
    return el.textContent || '';
  }, [html]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Label>Editor</Label>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Mode:</span>
          <Button type="button" variant={useVisualEditor ? "default" : "outline"} size="sm" onClick={() => setUseVisualEditor(true)}>Visual</Button>
          <Button type="button" variant={!useVisualEditor ? "default" : "outline"} size="sm" onClick={() => setUseVisualEditor(false)}>HTML</Button>
        </div>
      </div>

      {useVisualEditor ? (
        <>
          <div className="flex flex-wrap gap-2 mb-2 sticky top-0 bg-white z-10 py-2">
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("bold")}>Bold</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("italic")}>Italic</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { const url = prompt("Enter link URL", "https://"); if (url) { applyFormat("createLink", url); } }}>Link</Button>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Text</span>
              <input type="color" aria-label="Text color" onChange={(e) => applyFormat("foreColor", e.target.value)} className="w-6 h-6 p-0 border rounded" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Bg</span>
              <input type="color" aria-label="Background color" onChange={(e) => applyFormat("backColor", e.target.value)} className="w-6 h-6 p-0 border rounded" />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("removeFormat")}>Clear</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("formatBlock", "H1")}>H1</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("formatBlock", "H2")}>H2</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("formatBlock", "P")}>Normal</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("insertUnorderedList")}>Bulleted</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("insertOrderedList")}>Numbered</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("justifyLeft")}>Left</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("justifyCenter")}>Center</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("justifyRight")}>Right</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { const url = prompt("Enter image URL", "https://"); if (url) { document.execCommand("insertImage", false, url); if (visualRef.current) setHtml(visualRef.current.innerHTML); } }}>Image</Button>
            <Button type="button" variant="outline" size="sm" onClick={insertCTA}>CTA</Button>
            <select
              className="border rounded px-2 py-1 text-sm"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                document.execCommand("insertText", false, `{{${v}}}`);
                if (visualRef.current) setHtml(visualRef.current.innerHTML);
                e.currentTarget.value = "";
              }}
              aria-label="Insert variable"
            >
              <option value="">Variables</option>
              <option value="name">name</option>
              <option value="unsubscribe_link">unsubscribe_link</option>
              <option value="company">company</option>
            </select>
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(html)}>Copy HTML</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(textOnly)}>Copy Text</Button>
              <Button type="button" variant="outline" size="sm" onClick={sanitizeHtml}>Sanitize</Button>
            </div>
          </div>
          <div className="relative">
            {isEmpty && (
              <div className="pointer-events-none absolute inset-0 text-gray-400 p-3 text-sm">Start typing here… Use the toolbar to format. Variables like {"{{name}}"} are supported.</div>
            )}
            <div
              ref={visualRef}
              className="border rounded-md p-3 min-h-[240px] bg-white"
              contentEditable
              suppressContentEditableWarning
              onInput={() => { if (visualRef.current) setHtml(visualRef.current.innerHTML); }}
              onBlur={sanitizeHtml}
              onPaste={(e) => { e.preventDefault(); const text = e.clipboardData?.getData("text/plain") || ""; document.execCommand("insertText", false, text); if (visualRef.current) setHtml(visualRef.current.innerHTML); }}
            ></div>
          </div>

          {/* Links Panel */}
          <details className="mt-3 border rounded-md">
            <summary className="bg-gray-50 p-2 text-sm font-medium cursor-pointer">Links</summary>
            <div className="p-2 space-y-2">
              {anchors.length === 0 && (
                <div className="text-sm text-gray-500">No links detected</div>
              )}
              {anchors.map((a) => (
                <div key={a.index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                  <Input
                    value={a.text}
                    placeholder="Link text"
                    onChange={(e) => onUpdateAnchor(a.index, e.target.value, a.href)}
                  />
                  <Input
                    value={a.href}
                    placeholder="https://"
                    onChange={(e) => onUpdateAnchor(a.index, a.text, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </details>

          <div className="text-xs text-gray-500 mt-2 flex justify-between">
            <span>{textOnly.length} chars</span>
            <span>{textOnly.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>HTML Source (advanced)</Label>
              <span className="text-xs text-gray-500">For technical users</span>
            </div>
            <Textarea
              rows={10}
              className="font-mono text-xs"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </div>
        </>
      )}
    </>
  );
}
