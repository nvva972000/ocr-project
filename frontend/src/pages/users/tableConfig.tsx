import type { UserType, RoleType } from "@types/types";
import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconUserPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import RoleTags from "./components/RoleTags";

interface UserColumnProps {
  handleAssignRoles?: (userId: string) => void;
  handleRemoveRoles?: (userId: string) => void;
  handleUpdateRoles?: (userId: string) => void;
  handleEdit?: (userId: string) => void;
  handleDelete?: (payload: { id: string; name: string }) => void;
}

export const buildUserColumns = ({
  handleAssignRoles,
  handleRemoveRoles,
  handleUpdateRoles,
  handleEdit,
  handleDelete,
}: UserColumnProps): ColumnsType<UserType> => {
  const getActionMenu = (record: UserType): MenuProps => {
    const menuItems = [];
    
    if (handleAssignRoles) {
      menuItems.push({
        key: "assign-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconUserPlus size={16} /> Assign Roles
          </span>
        ),
        onClick: () => handleAssignRoles(record.id),
      });
    }
    
    if (handleUpdateRoles) {
      menuItems.push({
        key: "update-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconEdit size={16} /> Update Roles
          </span>
        ),
        onClick: () => handleUpdateRoles(record.id),
      });
    }
    
    if (handleRemoveRoles) {
      menuItems.push({
        key: "remove-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Remove Roles
          </span>
        ),
        onClick: () => handleRemoveRoles(record.id),
      });
    }

    if (handleEdit) {
      menuItems.push({
        key: "edit",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconEdit size={16} /> Edit User
          </span>
        ),
        onClick: () => handleEdit(record.id),
      });
    }

    if (handleDelete) {
      menuItems.push({
        key: "delete",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Delete User
          </span>
        ),
        onClick: () => handleDelete({ id: record.id, name: `${record.first_name} ${record.last_name}` }),
      });
    }
    
    return { items: menuItems };
  };

  return [
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_: any, record: UserType) => (
        <div style={{ fontWeight: 500, fontSize: "14px", color: "#000000" }}>
          {record.first_name} {record.last_name}
        </div>
      ),
      sorter: (a: UserType, b: UserType) => 
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>{email}</span>
      ),
      sorter: (a: UserType, b: UserType) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      width: 250,
      render: (roles: RoleType[]) => {
        return <RoleTags roles={roles || []} maxDisplay={2} />;
      }
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (created_at: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: UserType, b: UserType) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_, record: UserType) => {
        const menu = getActionMenu(record);
        if (menu.items && menu.items.length > 0) {
          return (
            <Dropdown
              menu={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<IconDotsVertical size={16} />}
                size="small"
                style={{
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  color: "#1A3636"
                }}
                onFocus={(e) => e.target.blur()}
              />
            </Dropdown>
          );
        }
        return null;
      },
    },
  ];
};

