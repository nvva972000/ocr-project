import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useUsers } from "@/hooks/queries/user/useUsers";
import { useSyncUsers } from "@/hooks/mutations/user/useSyncUsers";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { buildUserColumns } from "./tableConfig";

const ListUsers: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: users, total, isLoading, refetch } = useUsers({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  });

  // Use mutation hook for syncing users
  const syncUsersMutation = useSyncUsers({
    showToast: true,
    onSuccess: () => {
      refetch(); 
    },
  });

  const handleSyncUsers = () => {
    syncUsersMutation.mutate();
  };

  const handleAssignRoles = useCallback((userId: string) => {
    // TODO: Implement assign roles functionality
    console.log(`Assign roles for user: ${userId}`);
  }, []);

  const handleRemoveRoles = useCallback((userId: string) => {
    // TODO: Implement remove roles functionality
    console.log(`Remove roles for user: ${userId}`);
  }, []);

  const handleUpdateRoles = useCallback((userId: string) => {
    // TODO: Implement update roles functionality
    console.log(`Update roles for user: ${userId}`);
  }, []);

  const handleEdit = useCallback((userId: string) => {
    // TODO: Implement edit user functionality
    console.log(`Edit user: ${userId}`);
  }, []);

  const handleDelete = useCallback((payload: { id: string; name: string }) => {
    // TODO: Implement delete user functionality
    console.log(`Delete user: ${payload.name}`);
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
    <MainContainer>
      <HeaderInformation
        title="User Management"
        description="Manage users and their role assignments"
        action={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleSyncUsers}
            loading={syncUsersMutation.isPending}
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
        dataSource={users}
        rowKey="id"
        loading={isLoading}
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
    </MainContainer>
  );
};

export default ListUsers;

