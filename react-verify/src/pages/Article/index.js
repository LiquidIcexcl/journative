import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
//import "@ant-design/v5-patch-for-react-19";
import {
  getPostsAPI,
  deletePostAPI,
  rejectPostAPI,
  approvePostAPI,
} from "@/lib/appwrite.ts";
import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  //Select,
  Popconfirm,
  Dropdown,
} from "antd";
// 引入汉化包 时间选择器显示中文
//import locale from "antd/es/date-picker/locale/zh_CN";

// 导入资源
import { Table, Tag, Space } from "antd";

import img404 from "@/assets/error.png";

import { useEffect, useState } from "react";

const Article = () => {
  // 获取用户信息
  const userInfo = useSelector((state) => state.user.userInfo);
  const [reqData, setReqData] = useState({
    status: 0, // 默认显示待审核
    page: 1,
    per_page: 4,
  });

  const statusMap = {
    0: { text: "待审核", color: "warning" },
    1: { text: "审核通过", color: "success" },
    2: { text: "审核未通过", color: "error" },
  };

  // };
  const columns = [
    {
      title: "封面",
      dataIndex: "image_first_url",
      render: (url) => (
        <img src={url || img404} width={80} height={60} alt="封面" />
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 220,
    },
    {
      title: "状态",
      dataIndex: "via_state",
      render: (state) => (
        <Tag color={statusMap[state].color}>{statusMap[state].text}</Tag>
      ),
    },
    { title: "作者", dataIndex: "creator_name" },

    {
      title: "操作",
      render: (data) => (
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "approve",
                  label: (
                    <Popconfirm
                      title="确认通过审核？"
                      onConfirm={() => handleApprove(data.$id)}
                    >
                      <span>通过审核</span>
                    </Popconfirm>
                  ),
                },
                {
                  key: "reject",
                  label: (
                    <Popconfirm
                      title="确认拒绝审核？"
                      onConfirm={() => handleReject(data.$id)}
                    >
                      <span>拒绝审核</span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button type="link">审核操作</Button>
          </Dropdown>

          {userInfo?.super_type === 1 && (
            <Popconfirm
              title="确认逻辑删除？"
              onConfirm={() => handleDelete(data.$id)}
            >
              <Button danger type="link">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  // 获取帖子列表
  useEffect(() => {
    const getList = async () => {
      const res = await getPostsAPI(
        reqData.page,
        reqData.per_page,
        reqData.status
      );
      setList(res.documents);
      setCount(res.total);
    };
    getList();
  }, [reqData]);

  // 新增处理函数
  const handleApprove = async (postId) => {
    await approvePostAPI(postId);
    setReqData((prev) => ({ ...prev }));
  };

  const handleReject = async (postId) => {
    await rejectPostAPI(postId);
    setReqData((prev) => ({ ...prev }));
  };

  // 处理删除
  const handleDelete = async (postId) => {
    await deletePostAPI(postId);
    setReqData((prev) => ({ ...prev })); // 刷新列表
  };

  // 筛选表单提交
  const onFinish = (values) => {
    setReqData({
      ...reqData,
      status: values.status,
      page: 1, // 重置到第一页
    });
  };

  // 分页
  const onPageChange = (page) => {
    console.log(page);
    // 修改参数依赖项 引发数据的重新获取列表渲染
    setReqData({
      ...reqData,
      page,
    });
  };
  return (
    <div>
      <Card
        title={
          <Breadcrumb
            items={[
              { title: <Link to={"/"}>首页</Link> },
              { title: "帖子列表" },
            ]}
          />
        }
        style={{ marginBottom: 20 }}
      >
        <Form onFinish={onFinish} initialValues={{ status: 0 }}>
          <Form.Item label="审核状态" name="status">
            <Radio.Group>
              <Radio value={0}>待审核</Radio>
              <Radio value={1}>审核通过</Radio>
              <Radio value={2}>审核未通过</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
              筛选
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {/* 表格区域 */}
      <Card title={`根据筛选条件共查询到 ${count} 条结果：`}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{
            total: count,
            pageSize: reqData.per_page,
            onChange: onPageChange,
          }}
        />
      </Card>
    </div>
  );
};

export default Article;
