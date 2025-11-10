import React from 'react';
import { Typography, Input, Button, Table, Space, Divider, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

function InvoiceJsonForm({ jsonData, pageNumber, totalPages, onDataChange, onPageChange }) {
  // If no data, show empty state
  if (!jsonData) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '100px', color: '#999' }}>
        <p style={{ fontSize: 16 }}>No JSON data available for this page</p>
      </div>
    );
  }

  // Handle field change
  const handleFieldChange = (section, field, value) => {
    const updatedData = { ...jsonData };
    updatedData[section][field] = value;
    onDataChange(updatedData);
  };

  // Handle item change in table
  const handleItemChange = (index, field, value) => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  // Add new item
  const handleAddItem = () => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems.push({
      stt: (newItems.length + 1).toString(),
      name: '',
      unit: '',
      quantity: '',
      unit_price: '',
      amount: ''
    });
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  // Delete item
  const handleDeleteItem = (index) => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems.splice(index, 1);
    // Renumber items
    newItems.forEach((item, idx) => {
      item.stt = (idx + 1).toString();
    });
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  // Items table columns
  const itemColumns = [
    {
      title: '#',
      dataIndex: 'stt',
      key: 'stt',
      width: 50,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'stt', e.target.value)}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
        />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text, record, index) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (text, record, index) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(index)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {/* Page Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px',
        background: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <Button
          icon={<LeftOutlined />}
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          Previous
        </Button>
        <Space>
          <Text strong style={{ fontSize: 16 }}>Page {pageNumber} / {totalPages}</Text>
          <Tag color="blue">Editable</Tag>
        </Space>
        <Button
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
        >
          Next
        </Button>
      </div>

      {/* Seller Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '12px' }}>
          📦 Seller Information
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Name:</Text>
            <Input
              value={jsonData.seller?.name || ''}
              onChange={(e) => handleFieldChange('seller', 'name', e.target.value)}
              placeholder="Seller name"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Address:</Text>
            <TextArea
              value={jsonData.seller?.address || ''}
              onChange={(e) => handleFieldChange('seller', 'address', e.target.value)}
              placeholder="Address"
              rows={2}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Phone:</Text>
            <Input
              value={jsonData.seller?.phone || ''}
              onChange={(e) => handleFieldChange('seller', 'phone', e.target.value)}
              placeholder="Phone"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Fax:</Text>
            <Input
              value={jsonData.seller?.fax || ''}
              onChange={(e) => handleFieldChange('seller', 'fax', e.target.value)}
              placeholder="Fax"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Tax Code:</Text>
            <Input
              value={jsonData.seller?.tax_code || ''}
              onChange={(e) => handleFieldChange('seller', 'tax_code', e.target.value)}
              placeholder="Tax code"
            />
          </div>
        </Space>
      </div>

      <Divider />

      {/* Invoice Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '12px' }}>
          📄 Invoice Information
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Title:</Text>
            <Input
              value={jsonData.invoice?.title || ''}
              onChange={(e) => handleFieldChange('invoice', 'title', e.target.value)}
              placeholder="Invoice title"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Serial:</Text>
            <Input
              value={jsonData.invoice?.serial || ''}
              onChange={(e) => handleFieldChange('invoice', 'serial', e.target.value)}
              placeholder="Serial"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Number:</Text>
            <Input
              value={jsonData.invoice?.number || ''}
              onChange={(e) => handleFieldChange('invoice', 'number', e.target.value)}
              placeholder="Invoice number"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Date:</Text>
            <Input
              value={jsonData.invoice?.date || ''}
              onChange={(e) => handleFieldChange('invoice', 'date', e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>CQT Code:</Text>
            <Input
              value={jsonData.invoice?.cqt_code || ''}
              onChange={(e) => handleFieldChange('invoice', 'cqt_code', e.target.value)}
              placeholder="Mã của CQT"
            />
          </div>
        </Space>
      </div>

      <Divider />

      {/* Buyer Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '12px' }}>
          👤 Buyer Information
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Name:</Text>
            <Input
              value={jsonData.buyer?.name || ''}
              onChange={(e) => handleFieldChange('buyer', 'name', e.target.value)}
              placeholder="Buyer name"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Unit Name:</Text>
            <Input
              value={jsonData.buyer?.unit_name || ''}
              onChange={(e) => handleFieldChange('buyer', 'unit_name', e.target.value)}
              placeholder="Tên đơn vị"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>CCCD:</Text>
            <Input
              value={jsonData.buyer?.cccd || ''}
              onChange={(e) => handleFieldChange('buyer', 'cccd', e.target.value)}
              placeholder="Căn cước công dân"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Passport:</Text>
            <Input
              value={jsonData.buyer?.passport || ''}
              onChange={(e) => handleFieldChange('buyer', 'passport', e.target.value)}
              placeholder="Hộ chiếu"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Tax Code:</Text>
            <Input
              value={jsonData.buyer?.tax_code || ''}
              onChange={(e) => handleFieldChange('buyer', 'tax_code', e.target.value)}
              placeholder="Tax code"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Address:</Text>
            <TextArea
              spellCheck={false}
              value={jsonData.buyer?.address || ''}
              onChange={(e) => handleFieldChange('buyer', 'address', e.target.value)}
              placeholder="Address"
              rows={2}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Payment Method:</Text>
            <Input
              value={jsonData.buyer?.payment_method || ''}
              onChange={(e) => handleFieldChange('buyer', 'payment_method', e.target.value)}
              placeholder="Payment method"
            />
          </div>
        </Space>
      </div>

      <Divider />

      {/* Items Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Title level={5} style={{ margin: 0 }}>
            📋 Items ({jsonData.items?.length || 0})
          </Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </div>
        <Table
          columns={itemColumns}
          dataSource={jsonData.items || []}
          pagination={false}
          size="small"
          bordered
          rowKey={(record, index) => index}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Divider />

      {/* Totals Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '12px' }}>
          💰 Totals
        </Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Subtotal:</Text>
            <Input
              value={jsonData.totals?.subtotal || ''}
              onChange={(e) => handleFieldChange('totals', 'subtotal', e.target.value)}
              placeholder="Subtotal"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>VAT Rate (%):</Text>
            <Input
              value={jsonData.totals?.vat_rate || ''}
              onChange={(e) => handleFieldChange('totals', 'vat_rate', e.target.value)}
              placeholder="VAT rate"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>VAT Amount:</Text>
            <Input
              value={jsonData.totals?.vat_amount || ''}
              onChange={(e) => handleFieldChange('totals', 'vat_amount', e.target.value)}
              placeholder="VAT amount"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Total:</Text>
            <Input
              value={jsonData.totals?.total || ''}
              onChange={(e) => handleFieldChange('totals', 'total', e.target.value)}
              placeholder="Total"
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Total in Words:</Text>
            <TextArea
              value={jsonData.totals?.total_in_words || ''}
              onChange={(e) => handleFieldChange('totals', 'total_in_words', e.target.value)}
              placeholder="Total in words"
              rows={2}
            />
          </div>
        </Space>
      </div>

      <Divider />
    </div>
  );
}

export default InvoiceJsonForm;

