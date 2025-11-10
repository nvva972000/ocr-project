import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Upload, Button, message, Spin, Typography, Card, Pagination } from 'antd';
import { InboxOutlined, ThunderboltOutlined, CheckCircleOutlined, DeleteOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import axios from 'axios';
import InvoiceJsonForm from './InvoiceJsonForm';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

function App() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // Store all page results (markdown + JSON)
  const [editedResults, setEditedResults] = useState([]); // Store edited JSON data
  const [totalPages, setTotalPages] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentJsonPage, setCurrentJsonPage] = useState(1); // Current page in JSON viewer
  const [scale, setScale] = useState(1.5); // Zoom level

  // Sync JSON page with PDF page
  useEffect(() => {
    if (results.length > 0 && pageNumber <= results.length) {
      setCurrentJsonPage(pageNumber);
    }
  }, [pageNumber, results]);

  // Handle file upload
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    maxCount: 1,
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('You can only upload PDF files!');
        return false;
      }
      
      // Create URL for PDF preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFile(file);
      setPageNumber(1);
      message.success(`${file.name} selected successfully`);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      setFile(null);
      setFileUrl(null);
      setResults([]);
      setEditedResults([]);
      setTotalPages(0);
      setNumPages(null);
      setPageNumber(1);
      setCurrentJsonPage(1);
    },
  };

  // Handle PDF document load
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Remove PDF
  const handleRemovePDF = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(null);
    setResults([]);
    setEditedResults([]);
    setTotalPages(0);
    setNumPages(null);
    setPageNumber(1);
    setCurrentJsonPage(1);
    setScale(1.5);
  };

  // Zoom functions
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3)); // Max 3x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5)); // Min 0.5x
  };

  // Handle convert button click
  const handleConvert = async () => {
    if (!file) {
      message.warning('Please select a PDF file first!');
      return;
    }

    setLoading(true);
    setResults([]);
    setEditedResults([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      });

      if (response.data.success) {
        // Store results array
        setResults(response.data.results);
        // Initialize edited results with parsed JSON data
        setEditedResults(response.data.results.map(r => r.parsed_json));
        setTotalPages(response.data.total_pages);
        setCurrentJsonPage(1);
        message.success(`Successfully extracted ${response.data.total_pages} page(s)!`);
      } else {
        message.error('Conversion failed!');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'ECONNABORTED') {
        message.error('Request timeout! Please try again.');
      } else if (error.response) {
        message.error(`Backend error: ${error.response.status}`);
      } else if (error.request) {
        message.error('Cannot connect to backend. Make sure it is running at http://localhost:8000');
      } else {
        message.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle JSON data change
  const handleJsonDataChange = (pageIndex, updatedData) => {
    const newEditedResults = [...editedResults];
    newEditedResults[pageIndex] = updatedData;
    setEditedResults(newEditedResults);
  };

  // Handle JSON page change
  const handleJsonPageChange = (newPage) => {
    setCurrentJsonPage(newPage);
    setPageNumber(newPage); // Sync PDF viewer with JSON page
  };

  // Handle approve button
  const handleApprove = () => {
    if (editedResults.length > 0) {
      message.success('Data approved! ✅');
      console.log('Approved data (all pages):', editedResults);
    } else {
      message.warning('No data to approve. Please convert a PDF first.');
    }
  };

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5', overflow: 'hidden' }}>
      {/* Header */}
      <Header style={{ 
        background: '#fff', 
        padding: '12px 50px', 
        borderBottom: '2px solid #333',
        height: 'auto',
        flexShrink: 0
      }}>
        <Title level={3} style={{ margin: 0, marginBottom: '2px', lineHeight: 1 }}>OCR</Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>OCR - Optical Character Recognition</Text>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '16px 50px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Row gutter={12} style={{ flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - PDF Viewer */}
          <Col xs={24} lg={14} style={{ height: '100%', display: 'flex' }}>
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>PDF Viewer</span>
                  {file && (
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={handleRemovePDF}
                      size="small"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              }
              bordered={true}
              style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}
              bodyStyle={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                padding: file ? '12px' : '24px'
              }}
            >
              {!file ? (
                <Dragger {...uploadProps} style={{ padding: '20px' }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">Click or drag PDF file to this area</p>
                  <p className="ant-upload-hint">
                    Support for a single PDF file upload. Select your document to begin OCR processing.
                  </p>
                </Dragger>
              ) : (
                <>
                  <div style={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    background: '#525659',
                    padding: '20px',
                    borderRadius: '8px'
                  }}>
                     <Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div style={{ textAlign: 'center', color: '#fff', paddingTop: '100px' }}>
                          <Spin size="large" />
                          <p style={{ marginTop: 20 }}>Loading PDF...</p>
                        </div>
                      }
                    >
                      <Page 
                        pageNumber={pageNumber} 
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        scale={scale}
                      />
                    </Document>
                  </div>
                  
                  <div style={{ 
                    marginTop: 12, 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div>
                      <Text strong>{file.name}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                    </div>
                    
                    {/* Zoom controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Button 
                        size="small" 
                        icon={<ZoomOutOutlined />} 
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5}
                      />
                      <Text style={{ minWidth: '60px' }}>{Math.round(scale * 100)}%</Text>
                      <Button 
                        size="small" 
                        icon={<ZoomInOutlined />} 
                        onClick={handleZoomIn}
                        disabled={scale >= 3}
                      />
                    </div>
                    
                    {numPages && (
                      <Pagination
                        simple
                        current={pageNumber}
                        total={numPages}
                        pageSize={1}
                        onChange={(page) => setPageNumber(page)}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </div>
                </>
              )}
            </Card>
          </Col>

          {/* Center - Convert Button */}
          <Col xs={24} lg={2} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%'
          }}>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={handleConvert}
              disabled={!file || loading}
              loading={loading}
              style={{ 
                height: '50px',
                fontSize: '16px',
                fontWeight: 600,
                padding: '0 20px'
              }}
            >
              Convert
            </Button>
          </Col>

          {/* Right Panel - JSON Form */}
          <Col xs={24} lg={8} style={{ height: '100%', display: 'flex' }}>
            <Card 
              title={`Extracted JSON Data ${totalPages > 0 ? `(${totalPages} pages)` : ''}`}
              bordered={true}
              style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}
              bodyStyle={{ 
                flex: 1, 
                overflow: 'auto',
                background: '#fafafa',
                padding: 0
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', paddingTop: '100px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 20, color: '#666' }}>
                    Processing PDF... This may take a moment.
                  </p>
                </div>
              ) : editedResults.length > 0 ? (
                <InvoiceJsonForm
                  jsonData={editedResults[currentJsonPage - 1]}
                  pageNumber={currentJsonPage}
                  totalPages={totalPages}
                  onDataChange={(updatedData) => handleJsonDataChange(currentJsonPage - 1, updatedData)}
                  onPageChange={handleJsonPageChange}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', paddingTop: '100px' }}>
                  <p style={{ fontSize: 16, fontStyle: 'italic' }}>
                    Extracted JSON data will appear here...
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Upload a PDF and click Convert to begin
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Footer - Approve Button */}
      <Footer style={{ 
        textAlign: 'right', 
        background: '#f5f5f5',
        padding: '12px 50px',
        flexShrink: 0
      }}>
        <Button
          type="default"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleApprove}
          style={{ 
            fontWeight: 500,
            borderColor: '#333',
            color: '#333'
          }}
        >
          Approve
        </Button>
      </Footer>
    </Layout>
  );
}

export default App;

