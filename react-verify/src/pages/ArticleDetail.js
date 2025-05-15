import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Image, Tag, Button, Spin, Row, Col } from "antd";
import { getPostDetailAPI } from "@/lib/appwrite.ts";
import ReactPlayer from "react-player";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPostDetailAPI(postId);
        setPost(data);
      } catch (error) {
        console.error("加载失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [postId]);

  if (loading) return <Spin size="large" />;

  return (
    <Card
      title={post.title}
      extra={
        <Link to="/article">
          <Button>返回列表</Button>
        </Link>
      }
    >
      {/* 作者信息 */}
      <Tag color="blue">作者：{post.creator_name}</Tag>

      {/* 文字内容 */}
      <div style={{ margin: "20px 0", whiteSpace: "pre-wrap" }}>
        {post.content}
      </div>

      {/* 封面图 */}
      {/* {post.image_first_url && (
        <Image src={post.image_first_url} width="100%" />
      )} */}

      {/* 图片画廊（过滤掉视频） */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {post.images
          ?.filter((_, index) => index !== post.hasVideo) // 过滤掉视频URL
          ?.map((img, index) => (
            <Col key={index} span={8}>
              <Image
                src={img}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            </Col>
          ))}
      </Row>

      {/* 视频播放器 */}
      {post.videoUrl && (
        <div style={{ marginTop: 20 }}>
          <ReactPlayer
            url={post.videoUrl}
            controls
            width="100%"
            height="500px"
          />
        </div>
      )}
    </Card>
  );
};

export default PostDetail;
