import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { usePagination } from "@hooks/usePagination";
import { useDebounce } from "@hooks/useDebounce";
import { buildUserColumns } from "./tableConfig";
import type { UserType } from "@types/types";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { UserContainer, FilterContainer } from "./Users";

// Mock data - will be replaced with actual API calls
const mockUsers: UserType[] = [
  {
    id: "1",
    username: "john.doe",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    roles: [
      { id: "1", name: "Admin", code: "ADMIN", is_active: true, created_at: "", updated_at: "" },
      { id: "2", name: "Project Manager", code: "PROJECT_MANAGER", is_active: true, created_at: "", updated_at: "" },
    ],
  },
  {
    id: "2",
    username: "jane.smith",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    status: "active",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    roles: [
      { id: "3", name: "Test Engineer", code: "TEST_ENGINEER", is_active: true, created_at: "", updated_at: "" },
    ],
  },
  {
    id: "3",
    username: "bob.johnson",
    email: "bob.johnson@example.com",
    first_name: "Bob",
    last_name: "Johnson",
    status: "active",
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
    roles: [],
  },
];

const Users: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return mockUsers;
    const query = debouncedSearch.toLowerCase();
    return mockUsers.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [debouncedSearch]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, pageSize]);

  const total = filteredUsers.length;

  const handleSyncUsers = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success("Users synced successfully");
    }, 1000);
  };

  const handleAssignRoles = useCallback((userId: string) => {
    message.info(`Assign roles for user: ${userId}`);
  }, []);

  const handleRemoveRoles = useCallback((userId: string) => {
    message.info(`Remove roles for user: ${userId}`);
  }, []);

  const handleUpdateRoles = useCallback((userId: string) => {
    message.info(`Update roles for user: ${userId}`);
  }, []);

  const handleEdit = useCallback((userId: string) => {
    message.info(`Edit user: ${userId}`);
  }, []);

  const handleDelete = useCallback((payload: { id: string; name: string }) => {
    message.warning(`Delete user: ${payload.name}`);
  }, []);

  const columns = useMemo(
    () =>
      buildUserColumns({
        handleAssignRoles,
        handleRemoveRoles,
        handleUpdateRoles,
        handleEdit,
        handleDelete,
      }),
    [
      handleAssignRoles,
      handleRemoveRoles,
      handleUpdateRoles,
      handleEdit,
      handleDelete,
    ]
  );

  return (
    <UserContainer>
      <HeaderInformation
        title="User Management"
        description="Manage users and their role assignments"
        action={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleSyncUsers}
            loading={loading}
            style={{ background: '#1A3636', borderColor: '#1A3636' }}
          >
            Sync Users
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
            placeholder="Search by user name or email"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={paginatedUsers}
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

export default Users;

