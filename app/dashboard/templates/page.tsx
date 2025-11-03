"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Plus, Trash2, Edit, Eye, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { templateAPI } from "@/lib/api-client";
import VisualHtmlEditor from "@/components/dashboard/VisualHtmlEditor";

interface Template {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    prompt: "",
    save: false,
  });
  const [aiCategory, setAiCategory] = useState("marketing");
  const [aiEditDialogOpen, setAiEditDialogOpen] = useState(false);
  const [aiEditGenerating, setAiEditGenerating] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState("");

  // AI generation result (not auto-saved)
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiResult, setAiResult] = useState<{ subject: string; userReadable?: string; html: string } | null>(null);
  const [aiEditSubject, setAiEditSubject] = useState("");
  const [aiEditUserReadable, setAiEditUserReadable] = useState("");
  const [aiEditHtml, setAiEditHtml] = useState("");
  const [aiRefining, setAiRefining] = useState(false);
  const [aiRefinePrompt, setAiRefinePrompt] = useState("");

  // Visual editor state
  const [useVisualEditor, setUseVisualEditor] = useState(true);
  const [anchors, setAnchors] = useState<{ index: number; text: string; href: string }[]>([]);

  // Re-scan anchors whenever HTML changes
  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(aiEditHtml || "", "text/html");
      const list = Array.from(doc.querySelectorAll("a")).map((a, i) => ({ index: i, text: a.textContent || "", href: a.getAttribute("href") || "" }));
      setAnchors(list);
    } catch {}
  }, [aiEditHtml]);



  const updateAnchorAt = (idx: number, text: string, href: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(aiEditHtml || "", "text/html");
      const as = doc.querySelectorAll('a');
      const a = as[idx];
      if (a) {
        a.textContent = text;
        a.setAttribute('href', href || '#');
        const html = doc.documentElement.querySelector('body')?.innerHTML || '';
        // re-wrap with outer html structure if needed
        const full = `<!DOCTYPE html><html>${doc.head ? doc.head.outerHTML : '<head><meta charset="utf-8"></head>'}<body>${html}</body></html>`;
        setAiEditHtml(full);
      }
    } catch {}
  };

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    category: "marketing",
  });

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const data = await templateAPI.list();
      
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = editingTemplate 
        ? await templateAPI.update(editingTemplate.id, formData)
        : await templateAPI.create(formData);

      if (data.success) {
        toast({
          title: "Success",
          description: editingTemplate 
            ? "Template updated successfully" 
            : "Template created successfully",
        });
        setShowDialog(false);
        resetForm();
        loadTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!templateId || templateId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid template ID",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const data = await templateAPI.delete(templateId);

      if (data.success) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
        loadTemplates();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setAiEditSubject(template.subject || "");
    setAiEditUserReadable("");
    setAiEditHtml(template.htmlContent || "");
    setAiCategory(template.category || "marketing");
    setUseVisualEditor(true);
    setAiPreviewOpen(true);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      htmlContent: "",
      category: "marketing",
    });
    setEditingTemplate(null);
  };

  const handleNewTemplate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleSeedTemplates = async () => {
    try {
      const data = await templateAPI.seed();

      if (data.success) {
        toast({
          title: "Success",
          description: `${data.count} default templates added!`,
        });
        loadTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-gray-600">Create and manage reusable email templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
          <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Create with AI
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-4">Create your first email template or use our pre-built ones</p>
            <div className="flex gap-3">
              <Button onClick={handleNewTemplate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Create with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <Card key={template.id || `template-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="font-medium capitalize">{template.category}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={!template.id || template.id === 'undefined'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Generator Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Template with AI</DialogTitle>
            <DialogDescription>Describe the email you want. We will generate subject and responsive HTML.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prompt</Label>
              <Textarea value={aiForm.prompt} onChange={(e) => setAiForm({ ...aiForm, prompt: e.target.value })} placeholder="Describe the email you want. Example: Announce 30% off Diwali sale for 48 hours with code DIWALI30." />
            </div>
            <div>
              <Label>Category</Label>
              <select className="w-full border rounded p-2" value={aiCategory} onChange={(e) => setAiCategory(e.target.value)}>
                <option value="marketing">Marketing</option>
                <option value="newsletter">Newsletter</option>
                <option value="announcement">Announcement</option>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="save-ai" type="checkbox" checked={aiForm.save} onChange={(e) => setAiForm({ ...aiForm, save: e.target.checked })} />
              <Label htmlFor="save-ai">Save to templates</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!aiForm.prompt.trim()) {
                  toast({ title: 'Prompt required', description: 'Please describe the email to generate.', variant: 'destructive' });
                  return;
                }
                setAiGenerating(true);
                try {
                  const resp = await templateAPI.generateWithAI({ prompt: aiForm.prompt, save: aiForm.save });
                  if (resp.success) {
                    const t = resp.data as any;
                    // Always open AI preview (no auto-save). Subject and user-readable are editable here.
                    setAiResult({ subject: t.subject, userReadable: t.userReadable, html: t.html });
                    setAiEditSubject(t.subject || "");
                    setAiEditUserReadable(t.userReadable || "");
                    setAiEditHtml(t.html || "");
                    // Clear the prompt after successful generation
                    setAiForm(prev => ({ ...prev, prompt: "" }));
                    setAiDialogOpen(false);
                    setAiPreviewOpen(true);
                  } else {
                    throw new Error(resp.error || 'Generation failed');
                  }
                } catch (e: any) {
                  toast({ title: 'Error', description: e.message, variant: 'destructive' });
                } finally {
                  setAiGenerating(false);
                }
              }} disabled={aiGenerating}>
                {aiGenerating ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Email"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="marketing">Marketing</option>
                <option value="newsletter">Newsletter</option>
                <option value="announcement">Announcement</option>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="htmlContent">HTML Content</Label>
                {editingTemplate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAiEditPrompt("");
                      setAiEditDialogOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Update with AI
                  </Button>
                )}
              </div>
              <Textarea
                id="htmlContent"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                placeholder="Enter HTML content... Use {{name}} for personalization"
                rows={15}
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Tip: Use {`{{name}}`} to personalize with recipient's name
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Edit Dialog */}
      <Dialog open={aiEditDialogOpen} onOpenChange={setAiEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Template with AI</DialogTitle>
            <DialogDescription>
              Describe how you want to modify this template. The AI will update the subject and HTML content accordingly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Edit Instructions</Label>
              <Textarea
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                placeholder="Example: Make it more colorful, change the tone to friendly, add discount information, improve the CTA button..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe what changes you want to make to the template.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!aiEditPrompt.trim()) {
                    toast({
                      title: "Prompt required",
                      description: "Please describe how you want to modify the template.",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (!editingTemplate) {
                    toast({
                      title: "Error",
                      description: "No template selected for editing.",
                      variant: "destructive",
                    });
                    return;
                  }

                  setAiEditGenerating(true);
                  try {
                    const resp = await templateAPI.generateWithAI({
                      prompt: aiEditPrompt,
                      existingSubject: formData.subject,
                      existingHtml: formData.htmlContent,
                      editPrompt: aiEditPrompt,
                      save: false,
                    });

                    if (resp.success && resp.data) {
                      // Update the form with AI-generated content
                      setFormData({
                        ...formData,
                        subject: resp.data.subject || formData.subject,
                        htmlContent: resp.data.html || formData.htmlContent,
                      });
                      
                      toast({
                        title: "Success",
                        description: "Template updated with AI. Review and save your changes.",
                      });
                      setAiEditDialogOpen(false);
                      setAiEditPrompt("");
                    } else {
                      throw new Error(resp.error || "AI update failed");
                    }
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to update template with AI",
                      variant: "destructive",
                    });
                  } finally {
                    setAiEditGenerating(false);
                  }
                }}
                disabled={aiEditGenerating || !aiEditPrompt.trim()}
              >
                {aiEditGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Update with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Preview (not saved): user-readable editor + HTML preview */}
      <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Draft Preview</DialogTitle>
            <DialogDescription>
              Review and edit the draft. Use the HTML preview to see how it will render. Save when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-subject">Subject</Label>
              <Input id="ai-subject" value={aiEditSubject} onChange={(e) => setAiEditSubject(e.target.value)} />
            </div>


            <div className="space-y-1">
              <Label>Edit with AI</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Describe refinements (e.g., friendlier tone, shorter, change CTA)"
                  value={aiRefinePrompt}
                  onChange={(e) => setAiRefinePrompt(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={aiRefining || !aiRefinePrompt.trim()}
                  onClick={async () => {
                    if (!aiResult) return;
                    setAiRefining(true);
                    try {
                      const resp = await templateAPI.generateWithAI({
                        prompt: aiRefinePrompt,
                        existingSubject: aiEditSubject,
                        existingHtml: aiEditHtml || aiResult.html,
                        editPrompt: aiRefinePrompt,
                        save: false,
                      });
                      if (resp.success && resp.data) {
                        const t = resp.data as any;
                        setAiResult({ subject: t.subject, userReadable: t.userReadable, html: t.html });
                        setAiEditSubject(t.subject || "");
                        setAiEditUserReadable(t.userReadable || "");
                        setAiEditHtml(t.html || "");
                        setAiRefinePrompt("");
                      } else {
                        throw new Error(resp.error || 'AI refinement failed');
                      }
                    } catch (e: any) {
                      toast({ title: 'Error', description: e.message, variant: 'destructive' });
                    } finally {
                      setAiRefining(false);
                    }
                  }}
>
                  {aiRefining ? 'Refining…' : 'Refine'}
                </Button>
              </div>
            </div>

            <VisualHtmlEditor
              useVisualEditor={useVisualEditor}
              setUseVisualEditor={setUseVisualEditor}
              html={aiEditHtml}
              setHtml={setAiEditHtml}
              anchors={anchors}
              onUpdateAnchor={updateAnchorAt}
            />

            {!useVisualEditor && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3 border-b font-medium">HTML Preview</div>
                <iframe
                  srcDoc={(aiEditHtml || aiResult?.html || '').replace(/\{\{name\}\}/g, 'John Doe')}
                  className="w-full h-[360px]"
                  title="AI HTML Preview"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiPreviewOpen(false)}>Close</Button>
              <Button onClick={async () => {
                if (editingTemplate) {
                  try {
                    const payload = {
                      name: editingTemplate.name,
                      subject: aiEditSubject,
                      htmlContent: aiEditHtml || aiResult?.html || '',
                      category: aiCategory,
                    };
                    const resp = await templateAPI.update(editingTemplate.id, payload);
                    if (resp.success) {
                      toast({ title: 'Success', description: 'Template updated successfully' });
                      setAiPreviewOpen(false);
                      setEditingTemplate(null);
                      loadTemplates();
                    } else {
                      throw new Error(resp.error || 'Update failed');
                    }
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message, variant: 'destructive' });
                  }
                } else {
                  try {
                    const subject = (aiEditSubject || aiResult?.subject || '').trim();
                    const payload = {
                      name: (subject || 'AI Template').slice(0, 60) || 'AI Template',
                      subject: subject || 'AI Template',
                      htmlContent: aiEditHtml || aiResult?.html || '',
                      category: aiCategory,
                    };
                    const resp = await templateAPI.create(payload);
                    if (resp.success) {
                      toast({ title: 'Success', description: 'Template created successfully' });
                      setAiPreviewOpen(false);
                      setEditingTemplate(null);
                      loadTemplates();
                    } else {
                      throw new Error(resp.error || 'Create failed');
                    }
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message, variant: 'destructive' });
                  }
                }
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog for saved templates */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 p-4 border-b">
              <div className="text-sm text-gray-600">Subject:</div>
              <div className="font-semibold">{previewTemplate?.subject}</div>
            </div>
            <iframe
              srcDoc={previewTemplate?.htmlContent.replace(/\{\{name\}\}/g, "John Doe")}
              className="w-full h-[500px]"
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

