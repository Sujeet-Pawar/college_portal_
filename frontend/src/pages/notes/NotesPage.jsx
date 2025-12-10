import { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Download, Filter, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from '../../lib/axios';
import { useToast } from '../../components/ui/use-toast';
import './NotesPage.css';

export const NotesPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    description: '',
    tag: 'Reference',
    pages: '',
    course: '',
  });

  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const apiBaseUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/?api\/v1$/, '');
    }
    return 'http://localhost:5000';
  }, []);

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/courses');
        return data.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    },
  });

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', selectedSubject, selectedCourse],
    queryFn: async () => {
      try {
        const params = {};
        if (selectedSubject !== 'All') {
          params.subject = selectedSubject;
        }
        if (selectedCourse !== 'All') {
          params.courseId = selectedCourse;
        }
        const { data } = await axios.get('/notes', {
          params,
        });
        return data.data || [];
      } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
      }
    },
  });

  const subjects = useMemo(() => {
    const set = new Set(['All']);
    (notesData || []).forEach((note) => {
      if (note.subject) {
        set.add(note.subject);
      }
    });
    if (uploadForm.subject && !set.has(uploadForm.subject)) {
      set.add(uploadForm.subject);
    }
    return Array.from(set).sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [notesData, uploadForm.subject]);

  const courseOptions = useMemo(() => {
    const options = [{ value: 'All', label: 'All Courses' }];
    (coursesData || [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((course) => {
        options.push({ value: course._id, label: course.name, code: course.code });
      });
    return options;
  }, [coursesData]);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post('/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Note shared',
        description: 'Your notes are now available for everyone.',
      });
      setUploadForm({
        title: '',
        subject: '',
        description: '',
        tag: 'Reference',
        pages: '',
        course: '',
      });
      setFile(null);
      setShowUpload(false);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Unable to upload notes. Try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleUploadInputChange = (field, value) => {
    setUploadForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelection = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = (event) => {
    event.preventDefault();
    if (!uploadForm.title.trim()) {
      toast({
        title: 'Add a title',
        description: 'Please provide a title for the notes.',
        variant: 'destructive',
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Attach a file',
        description: 'Please upload the notes file before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);

    if (uploadForm.subject) {
      formData.append('subject', uploadForm.subject);
    }

    if (uploadForm.description) {
      formData.append('description', uploadForm.description);
    }

    if (uploadForm.tag) {
      formData.append('tag', uploadForm.tag);
    }

    if (uploadForm.pages) {
      formData.append('pages', uploadForm.pages);
    }

    if (uploadForm.course && uploadForm.course !== 'All') {
      formData.append('course', uploadForm.course);
    }

    formData.append('file', file);

    uploadMutation.mutate(formData);
  };

  const filteredNotes = notesData || [];

  const groupedNotes = useMemo(() => {
    const groups = filteredNotes.reduce((acc, note) => {
      const courseName = note.course?.name || note.courseName || note.subject || 'General';
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(note);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([courseName, notes]) => ({
        courseName,
        notes: notes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
      }));
  }, [filteredNotes]);

  if (isLoading) {
    return (
      <div className="notes-page">
        <div className="loading-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="notes-header"
      >
        <div className="notes-header-left">
          <div>
            <h1 className="notes-title">Notes Sharing</h1>
            <p className="notes-subtitle">Upload, discover, and download materials by course</p>
          </div>
          <p className="notes-helper-text">
            Students and faculty can contribute resources to support their friends and juniors.
          </p>
        </div>
        <div className="notes-header-actions">
          <Button onClick={() => setShowUpload((prev) => !prev)} variant={showUpload ? 'secondary' : 'default'}>
            <UploadCloud className="h-4 w-4" />
            {showUpload ? 'Close uploader' : 'Share your notes'}
          </Button>
        </div>
      </motion.div>

      {showUpload && (
        <Card className="notes-upload-card">
          <CardContent>
            <form className="notes-upload-form" onSubmit={handleUploadSubmit}>
              <div className="notes-upload-grid">
                <div className="notes-upload-field">
                  <label htmlFor="note-title">Title</label>
                  <input
                    id="note-title"
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => handleUploadInputChange('title', e.target.value)}
                    placeholder="e.g. Algorithms Unit 2 Summary"
                    required
                  />
                </div>

                <div className="notes-upload-field">
                  <label htmlFor="note-subject">Subject</label>
                  <input
                    id="note-subject"
                    type="text"
                    value={uploadForm.subject}
                    onChange={(e) => handleUploadInputChange('subject', e.target.value)}
                    placeholder="Enter subject (optional if course selected)"
                  />
                </div>

                <div className="notes-upload-field">
                  <label htmlFor="note-course">Course</label>
                  <select
                    id="note-course"
                    value={uploadForm.course || ''}
                    onChange={(e) => handleUploadInputChange('course', e.target.value)}
                  >
                    <option value="">Select course (optional)</option>
                    {courseOptions
                      .filter((option) => option.value !== 'All')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} {option.code ? `(${option.code})` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="notes-upload-field notes-upload-field--wide">
                  <label htmlFor="note-description">Description</label>
                  <textarea
                    id="note-description"
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => handleUploadInputChange('description', e.target.value)}
                    placeholder="Add context, topics covered, or special instructions"
                  />
                </div>

                <div className="notes-upload-field">
                  <label htmlFor="note-tag">Tag</label>
                  <select
                    id="note-tag"
                    value={uploadForm.tag}
                    onChange={(e) => handleUploadInputChange('tag', e.target.value)}
                  >
                    <option value="Reference">Reference</option>
                    <option value="Important">Important</option>
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>

                <div className="notes-upload-field">
                  <label htmlFor="note-pages">Pages</label>
                  <input
                    id="note-pages"
                    type="number"
                    min="0"
                    value={uploadForm.pages}
                    onChange={(e) => handleUploadInputChange('pages', e.target.value)}
                    placeholder="e.g. 12"
                  />
                </div>

                <div className="notes-upload-field notes-upload-field--file">
                  <label>Upload file</label>
                  <div className="notes-upload-file-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png"
                      onChange={handleFileSelection}
                    />
                    {file ? (
                      <span className="notes-upload-file-name">{file.name}</span>
                    ) : (
                      <span className="notes-upload-file-placeholder">Choose a file to upload</span>
                    )}
                  </div>
                  <p className="notes-upload-hint">PDF, DOCX, PPT, ZIP, or images up to 10MB.</p>
                </div>
              </div>

              <div className="notes-upload-actions">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Publish notes'}
                </Button>
                <p className="notes-upload-disclaimer">
                  Uploaded notes will be visible to all authenticated students and teachers.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="notes-filters">
        <Filter className="notes-filter-icon" />
        <div className="notes-filter-buttons">
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? 'default' : 'outline'}
              className={`notes-filter-button ${selectedSubject === subject ? 'active' : ''}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
        <div className="notes-course-filter">
          <label htmlFor="course-filter-select">Course</label>
          <select
            id="course-filter-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="notes-groups">
        {groupedNotes.length > 0 ? (
          groupedNotes.map(({ courseName, notes }) => (
            <section key={courseName} className="notes-group">
              <header className="notes-group-header">
                <div>
                  <h2>{courseName}</h2>
                  <p>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
                </div>
              </header>
              <div className="notes-grid">
                {notes.map((note) => {
                  const tagColorMap = {
                    Important: 'red',
                    Exam: 'gray',
                    Reference: 'blue',
                    Assignment: 'gray',
                  };
                  const tagColor = tagColorMap[note.tag] || 'gray';

                  return (
                    <Card key={note._id || note.id} className="notes-card">
                      <CardContent className="notes-card-content">
                        <div className="notes-card-header">
                          <FileText className="notes-card-icon" />
                          <span className={`notes-card-tag notes-card-tag-${tagColor}`}>
                            {note.tag || 'Reference'}
                          </span>
                        </div>
                        <h3 className="notes-card-title">{note.title}</h3>
                        <div className="notes-card-meta">
                          {note.course?.code && (
                            <p className="notes-card-course">{note.course.code}</p>
                          )}
                          <p className="notes-card-subject">{note.subject}</p>
                          <p className="notes-card-author">By: {note.author?.name || note.author || 'Unknown'}</p>
                          <p className="notes-card-date">
                            {note.createdAt
                              ? new Date(note.createdAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </p>
                          <p className="notes-card-pages">Pages: {note.pages || 0}</p>
                          {note.downloadCount > 0 && (
                            <p className="notes-card-downloads">Downloaded {note.downloadCount} times</p>
                          )}
                        </div>
                        <div className="notes-card-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            className="notes-action-button"
                            onClick={() => {
                              if (note.fileUrl) {
                                window.open(`${apiBaseUrl}/${note.fileUrl}`, '_blank', 'noopener');
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="notes-empty">
            <p>No notes found. Be the first to share resources for this course!</p>
          </div>
        )}
      </div>
    </div>
  );
};

