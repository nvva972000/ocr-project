import type { ActivityLogType } from "@types/types";
import type { ColumnsType } from "antd/es/table";
import { Tag } from "antd";

export const buildActivityLogColumns = (): ColumnsType<ActivityLogType> => {
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "#1A3636";
      case "UPDATE":
        return "#2A5656";
      case "DELETE":
        return "#ff4d4f";
      case "LOGIN":
      case "LOGOUT":
        return "#3A7676";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "#1A3636";
      case "failed":
        return "#ff4d4f";
      default:
        return "default";
    }
  };

  return [
    {
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
      width: 150,
      render: (user_name: string) => (
        <span style={{ fontSize: "13px", color: "#000000", fontWeight: 500 }}>
          {user_name || "--"}
        </span>
      ),
      sorter: (a: ActivityLogType, b: ActivityLogType) => 
        (a.user_name || '').localeCompare(b.user_name || ''),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action: string) => (
        <Tag color={getActionColor(action)} style={{ fontSize: "12px", fontWeight: 600 }}>
          {action}
        </Tag>
      ),
      sorter: (a: ActivityLogType, b: ActivityLogType) => a.action.localeCompare(b.action),
    },
    {
      title: "Resource Type",
      dataIndex: "resource_type",
      key: "resource_type",
      width: 150,
      render: (resource_type: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {resource_type}
        </span>
      ),
      sorter: (a: ActivityLogType, b: ActivityLogType) => 
        a.resource_type.localeCompare(b.resource_type),
    },
    {
      title: "Resource Name",
      dataIndex: "resource_name",
      key: "resource_name",
      width: 200,
      render: (resource_name: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {resource_name || "--"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: "12px" }}>
          {status.toUpperCase()}
        </Tag>
      ),
      sorter: (a: ActivityLogType, b: ActivityLogType) => 
        a.status.localeCompare(b.status),
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 130,
      render: (ip_address: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {ip_address || "--"}
        </span>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (created_at: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleString() : '--'}
        </span>
      ),
      sorter: (a: ActivityLogType, b: ActivityLogType) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
      defaultSortOrder: "descend" as const,
    },
  ];
};

