import { Client, Account, Avatars, Databases, Storage, Query } from "appwrite";
const databaseId = "6824544b001f6e39416f";
const projectId = "6824513a000a9628379d";
const bucketId = "6816cdce000e3f0bd051";
const collectionIdUser = "6816bf9d000fc4bfb34b";
const collectionIdFollow = "6816c7c2000b6360b84d";
const collectionIdPost = "682455b3003606cb4b12";
const collectionIdComment = "6816c7c80037305d9a4c";
const collectionIdSuper = "6824548a000d5462c639";

let client: Client;

client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(projectId);

  // .setKey("standard_cc061d4fa7cae4e3c60b736c20fcdc56aafc0da6f638540b37828c2241d950a05dd2d7494d824fd80e528e89a3bddb43052757f4c40e451676138616c31e2a863566a51ab2c18cfe8f983c03fb3f67a1006bd09643df15df2f6b55bb5fb874519e9e7a27f678582e2e4fce485d9a46da73e43f38914264a0f1531223a525b404");
// .setPlatform('journative');


client.setJWT(window.localStorage.getItem('session') || '');

const account = new Account(client);
const database = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);




// 审核人员登录,审核人员的super_name和super_password字段是在database中的super表中存储的
export async function loginSuperAPI(super_name: string, super_password: string) {
  try {
    console.log("super_name", super_name);
    console.log("super_password", super_password);
    
    const response = await database.listDocuments(databaseId, collectionIdSuper, [
      Query.equal("super_name", super_name),
      Query.equal("super_password", super_password),
    ]);

    if (response.documents.length > 0) {
      return response.documents[0]; // Return the matched super user document
    } else {
      throw new Error("Invalid super_name or super_password");
    }
  } catch (error) {
    console.error("Error logging in super user:", error);
    throw error;
  }
}

// 审核人员登出
export async function logoutSuperAPI(navigate: (path: string) => void) {
  try {
    //await account.deleteSession("current"); // 删除当前会话
    navigate("/login"); // 跳转到登录界面
  } catch (error) {
    console.error("Error logging out super user:", error);
    throw error;
  }
}

// 获取审核人员信息,包括super_id,super_name,super_password,super_type，都存在database中的super表中
export async function getSuperInfoAPI(super_id: string) {
  try {
    const response = await database.getDocument(databaseId, collectionIdSuper, super_id);
    return response;
  } catch (error) {
    console.error("Error fetching super user info:", error);
    throw error;
  }
}

// 获取所有帖子信息，包括content,title,image_first_url,creator_name,creator_id,via_state,hasVideo,del_flag字段，存储在database中的posts表中
export async function getAllPostsAPI() {
  try {
    const response = await database.listDocuments(databaseId, collectionIdPost);
    return response.documents;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}

// appwrite.ts 新增接口
// 更新帖子审核状态
export async function updatePostStatusAPI(postId: string, newStatus: number) {
  try {
    return await database.updateDocument(
      databaseId,
      collectionIdPost,
      postId,
      { via_state: newStatus }
    );
  } catch (error) {
    console.error("Error updating post status:", error);
    throw error;
  }
}

// appwrite.ts 新增审核接口
export async function approvePostAPI(postId: string) {
  return updatePostStatusAPI(postId, 1);
}

export async function rejectPostAPI(postId: string) {
  return updatePostStatusAPI(postId, 2);
}

// 逻辑删除帖子
export async function deletePostAPI(postId: string) {
  try {
    return await database.updateDocument(
      databaseId,
      collectionIdPost,
      postId,
      { del_flag: 1 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// 带分页和过滤的帖子获取
// 增强获取帖子接口
export async function getPostsAPI(
  page: number = 1,
  pageSize: number = 4,
  status?: number
) {
  try {
    const queries = [
      Query.equal("del_flag", 0),
      Query.limit(pageSize),
      Query.offset((page - 1) * pageSize),
      Query.orderDesc("$createdAt")
    ];

    if (status !== undefined) {
      queries.push(Query.equal("via_state", status));
    }

    const response = await database.listDocuments(
      databaseId,
      collectionIdPost,
      queries
    );

    return {
      total: response.total,
      documents: response.documents.map(post => ({
        ...post,
        cover: post.image_first_url
      })),
      currentPage: page
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}