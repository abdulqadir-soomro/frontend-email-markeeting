import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TemplateManager = ({ userProfile, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    description: '',
    category: 'general'
  });

  const categories = [
    { value: 'general', label: 'General', icon: 'fas fa-envelope' },
    { value: 'marketing', label: 'Marketing', icon: 'fas fa-bullhorn' },
    { value: 'newsletter', label: 'Newsletter', icon: 'fas fa-newspaper' },
    { value: 'promotional', label: 'Promotional', icon: 'fas fa-tag' },
    { value: 'welcome', label: 'Welcome', icon: 'fas fa-handshake' },
    { value: 'followup', label: 'Follow-up', icon: 'fas fa-redo' }
  ];

  const defaultTemplates = [
    {
      name: 'Professional Business',
      subject: 'Important Update from [Company Name]',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">[Company Name]</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Communication</p>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Hello [Name],</h2>
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              We hope this message finds you well. We wanted to reach out to you regarding an important update that we believe will be of interest to you.
            </p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-bottom: 15px;">Key Points:</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>Professional and clean design</li>
                <li>Responsive layout for all devices</li>
                <li>Clear call-to-action buttons</li>
                <li>Branded header and footer</li>
              </ul>
            </div>
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
              If you have any questions or would like to discuss this further, please don't hesitate to contact us.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Learn More
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              © 2024 [Company Name]. All rights reserved.<br>
              <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
      description: 'Clean and professional business email template',
      category: 'general'
    },
    {
      name: 'Marketing Campaign',
      subject: '🎉 Special Offer Just for You, [Name]!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 SPECIAL OFFER</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Limited Time Only!</p>
          </div>
          <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Hello [Name]!</h2>
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px; text-align: center; font-size: 16px;">
              We have an exclusive offer that we think you'll love! Don't miss out on this amazing opportunity.
            </p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h3 style="margin: 0 0 10px 0; font-size: 24px;">50% OFF</h3>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Use code: SAVE50</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">
                Claim Your Offer Now!
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
              *Offer expires in 48 hours. Terms and conditions apply.
            </p>
          </div>
        </div>
      `,
      description: 'Eye-catching marketing email with special offers',
      category: 'marketing'
    },
    {
      name: 'Newsletter Template',
      subject: '📰 Weekly Newsletter - [Date]',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📰 Weekly Newsletter</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Stay updated with our latest news</p>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Hello [Name],</h2>
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
              Welcome to this week's newsletter! Here's what's happening in our world.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="color: #2d3748; margin-bottom: 15px;">📈 This Week's Highlights</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>New product launches and updates</li>
                <li>Industry insights and trends</li>
                <li>Customer success stories</li>
                <li>Upcoming events and webinars</li>
              </ul>
            </div>

            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin-bottom: 15px;">Featured Article</h3>
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                <div style="padding: 20px;">
                  <h4 style="margin: 0 0 10px 0; color: #2d3748;">Article Title Here</h4>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Brief description of the article content...</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Read Full Newsletter
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              © 2024 [Company Name]. All rights reserved.<br>
              <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Update Preferences</a>
            </p>
          </div>
        </div>
      `,
      description: 'Professional newsletter template with sections',
      category: 'newsletter'
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [userProfile]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      let userTemplates = [];
      
      // Only load user templates if userProfile exists
      if (userProfile?.uid) {
        const templatesRef = collection(db, 'emailTemplates');
        const q = query(templatesRef, where('userId', '==', userProfile.uid));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          userTemplates.push({
            id: doc.id,
            ...doc.data(),
            isDefault: false
          });
        });
      }

      // Add default templates
      const allTemplates = [
        ...defaultTemplates.map(t => ({ ...t, id: `default-${t.name}`, isDefault: true })),
        ...userTemplates
      ];

      console.log('Loaded templates:', allTemplates);
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to default templates only
      const allTemplates = defaultTemplates.map(t => ({ ...t, id: `default-${t.name}`, isDefault: true }));
      setTemplates(allTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    
    try {
      if (!userProfile?.uid) {
        throw new Error('User not authenticated');
      }

      const templateData = {
        ...templateForm,
        userId: userProfile.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving template:', templateData);

      if (editingTemplate) {
        await updateDoc(doc(db, 'emailTemplates', editingTemplate.id), templateData);
        console.log('Template updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'emailTemplates'), templateData);
        console.log('Template created successfully with ID:', docRef.id);
      }

      setShowModal(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        subject: '',
        htmlContent: '',
        description: '',
        category: 'general'
      });
      
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Error saving template: ${error.message}`);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      description: template.description,
      category: template.category
    });
    setShowModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteDoc(doc(db, 'emailTemplates', templateId));
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleUseTemplate = (template) => {
    onTemplateSelect(template);
  };

  if (loading) {
    return (
      <div className="template-loading">
        <div className="loading-spinner">
          <i className="fas fa-file-alt fa-spin"></i>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-manager">
      <div className="template-header">
        <h2>
          <i className="fas fa-file-alt"></i>
          Email Templates
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i>
          Create Template
        </button>
      </div>

      {/* Category Filter */}
      <div className="template-filters">
        <div className="category-tabs">
          <button 
            className={`category-tab ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Templates
          </button>
          {categories.map(category => (
            <button 
              key={category.value}
              className={`category-tab ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <i className={category.icon}></i>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="no-templates">
            <i className="fas fa-file-alt"></i>
            <h3>No Templates Found</h3>
            <p>Create your first template to get started!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus"></i>
              Create Template
            </button>
          </div>
        ) : (
          templates
            .filter(template => !selectedCategory || template.category === selectedCategory)
            .map(template => (
          <div key={template.id} className="template-card">
            <div className="template-preview">
              <div 
                className="template-iframe"
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
                style={{ 
                  maxHeight: '200px', 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}
              ></div>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <div className="template-meta">
                <span className="template-category">
                  <i className={categories.find(c => c.value === template.category)?.icon}></i>
                  {categories.find(c => c.value === template.category)?.label}
                </span>
                {template.isDefault && (
                  <span className="template-badge">Default</span>
                )}
              </div>
            </div>
            <div className="template-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleUseTemplate(template)}
              >
                <i className="fas fa-check"></i>
                Use Template
              </button>
              {!template.isDefault && (
                <>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content template-modal">
            <div className="modal-header">
              <h3>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                  setTemplateForm({
                    name: '',
                    subject: '',
                    htmlContent: '',
                    description: '',
                    category: 'general'
                  });
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveTemplate} className="template-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Subject</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  placeholder="Use [Name] for personalization"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  placeholder="Brief description of this template"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>HTML Content</label>
                <textarea
                  value={templateForm.htmlContent}
                  onChange={(e) => setTemplateForm({...templateForm, htmlContent: e.target.value})}
                  rows="20"
                  placeholder="Enter your HTML email content here. Use [Name] for personalization."
                  required
                />
              </div>

              </form>
            </div>
            <div className="modal-footer">
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSaveTemplate}>
                  <i className="fas fa-save"></i>
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
