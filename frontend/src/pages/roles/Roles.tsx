import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, message, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { usePagination } from "@hooks/usePagination";
import { useDebounce } from "@hooks/useDebounce";
import { buildRoleColumns } from "./tableConfig";
import type { RoleType } from "@types/types";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { UserContainer, FilterContainer } from "@pages/users/Users";

// Mock data - will be replaced with actual API calls
const mockRoles: RoleType[] = [
  {
    id: "1",
    name: "Admin",
    code: "ADMIN",
    description: "Administrator with full system access",
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 5,
  },
  {
    id: "2",
    name: "Project Manager",
    code: "PROJECT_MANAGER",
    description: "Manages projects and team members",
    is_active: true,
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    user_count: 12,
  },
  {
    id: "3",
    name: "Test Engineer",
    code: "TEST_ENGINEER",
    description: "Performs testing and quality assurance",
    is_active: true,
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
    user_count: 8,
  },
  {
    id: "4",
    name: "Viewer",
    code: "VIEWER",
    description: "Read-only access to view data",
    is_active: true,
    created_at: "2024-02-10T11:00:00Z",
    updated_at: "2024-02-10T11:00:00Z",
    user_count: 20,
  },
];

const Roles: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filter roles based on search query
  const filteredRoles = useMemo(() => {
    if (!debouncedSearch) return mockRoles;
    const query = debouncedSearch.toLowerCase();
    return mockRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.code.toLowerCase().includes(query) ||
        (role.description && role.description.toLowerCase().includes(query))
    );
  }, [debouncedSearch]);

  // Paginate filtered roles
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, page, pageSize]);

  const total = filteredRoles.length;

  const handleSyncRoles = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success("Roles synced successfully");
    }, 1000);
  };

  const handleEdit = useCallback((roleId: string) => {
    message.info(`Edit role: ${roleId}`);
  }, []);

  const handleDelete = useCallback((payload: { id: string; name: string }) => {
    message.warning(`Delete role: ${payload.name}`);
  }, []);

  const handleToggleActive = useCallback((roleId: string) => {
    message.info(`Toggle active status for role: ${roleId}`);
  }, []);

  const columns = useMemo(
    () =>
      buildRoleColumns({
        handleEdit,
        handleDelete,
        handleToggleActive,
      }),
    [handleEdit, handleDelete, handleToggleActive]
  );

  return (
    <UserContainer>
      <HeaderInformation
        title="Role Management"
        description="Manage roles and their permissions"
        action={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleSyncRoles}
            loading={loading}
            style={{ background: '#1A3636', borderColor: '#1A3636' }}
          >
            Sync Roles
          </Button>
        }
      />
      
      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, width: '100%' }}>
          <InputFilter
            label="Quick search"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (value === "") {
                setPage(1);
              }
            }}
            placeholder="Search by role name or code"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={paginatedRoles}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #eaeaea",
          borderRadius: "6px",
          overflow: "auto",
          fontSize: "13px",
          backgroundColor: "#ffffff",
        }}
        scroll={{ x: "max-content" }}
        tableLayout="auto"
      />

      <Pagination
        align="start"
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(p) => setPage(p)}
        onShowSizeChange={(_, size) => setPageSize(size)}
        showSizeChanger
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
        style={{ 
          backgroundColor: "#ffffff", 
          padding: "16px", 
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}
      />
    </UserContainer>
  );
};

export default Roles;

