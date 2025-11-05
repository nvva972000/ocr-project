import React from 'react';
import { Button, Slider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { OCRFooter } from '../OCR.styles';

interface OCRFooterProps {
  extractProgress: number;
  extractedData: string;
  onApprove: () => void;
}

const OCRFooterComponent: React.FC<OCRFooterProps> = ({ 
  extractProgress, 
  extractedData, 
  onApprove 
}) => {
  return (
    <OCRFooter>
      <Slider
        value={extractProgress}
        disabled
        style={{ flex: 1, maxWidth: 'calc(100% - 120px)' }}
        trackStyle={{ 
          backgroundColor: extractProgress > 0 ? '#1A3636' : '#e2e8f0',
          background: extractProgress > 0 
            ? 'linear-gradient(90deg, #1A3636 0%, #2A5656 100%)' 
            : '#e2e8f0',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '4px',
          borderRadius: '2px',
        }}
        railStyle={{
          backgroundColor: '#e2e8f0',
          height: '4px',
          borderRadius: '2px',
        }}
        handleStyle={{ 
          display: 'none', // Hide the handle
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={onApprove}
        disabled={!extractedData}
        style={{
          background: extractedData ? '#1A3636' : '#d9d9d9',
          borderColor: extractedData ? '#1A3636' : '#d9d9d9',
          color: '#FFFFFF',
          minWidth: '120px',
          height: '40px',
          fontWeight: 600,
          boxShadow: extractedData ? '0 2px 8px rgba(26, 54, 54, 0.3)' : 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (extractedData) {
            e.currentTarget.style.background = '#2A5656';
            e.currentTarget.style.borderColor = '#2A5656';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 54, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (extractedData) {
            e.currentTarget.style.background = '#1A3636';
            e.currentTarget.style.borderColor = '#1A3636';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(232, 90, 90, 0.3)';
          }
        }}
      >
        Approve
      </Button>
    </OCRFooter>
  );
};

export default OCRFooterComponent;

