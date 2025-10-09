"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Plus, Trash2, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { templateAPI } from "@/lib/api-client";

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
    setFormData({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      category: template.category,
    });
    setShowDialog(true);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading templates...</div>
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
        <Button onClick={handleNewTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
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
              <Button onClick={handleSeedTemplates} variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Add 5 Sample Templates
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
              <Label htmlFor="htmlContent">HTML Content</Label>
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

      {/* Preview Dialog */}
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

