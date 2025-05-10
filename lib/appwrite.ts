import * as FileSystem from 'expo-file-system';
import { ImageResult } from 'expo-image-manipulator';
import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import { User } from './modal';

const databaseId = "6816bee7001e6018e128";
const projectId = "6816be9b001517c67a5c";
const bucketId = "6816cdce000e3f0bd051";
const collectionIdUser = "6816bf9d000fc4bfb34b";
const collectionIdFollow="6816c7c2000b6360b84d"
const collectionIdPost = "6816c7ce0026b1143612"
const collectionIdComment = "6816c7c80037305d9a4c"

let client: Client;


client = new Client()
.setEndpoint('https://fra.cloud.appwrite.io/v1')
.setProject(projectId)
// .setPlatform('journative'); 

const account = new Account(client)
const database = new Databases(client)
const avatars = new Avatars(client)
const storage = new Storage(client)
 

// 检查当前用户是否登录（存在会话）
export const checkLogin = async () => {
    try {
        const res = await account.get().catch(() => { }); // 获取当前用户会话
        if (res && res.$id) {
            console.log('用户会话存在');
            return true
        }
        console.log('用户会话不存在');
        return false
    } catch (error) {
        console.log('checkLogin error', error)
        console.log(error)
        return false
    }
}

export const uploadFile = async (image_key: string, image_type: string, file: ImageResult|{ uri: string }) => {
    try { 
        let finalUri = file.uri;
        const fileInfo = await FileSystem.getInfoAsync(finalUri);
        if (!fileInfo.exists) throw new Error("文件不存在"); 
        let finalSize = (fileInfo as any).size;
        const res = await storage.createFile(bucketId, ID.unique(), {
            name: image_key,
            type: image_type = image_type==="image"?'image/jpeg':'video/mp4',
            size: image_type === "image" 
            ? (file as ImageResult).height * (file as ImageResult).width 
            : finalSize,
            uri: finalUri
        })

        const fileId = res.$id
        
        // const fileUrl = storage.getFilePreview(bucketId, fileId, 640, 360, ImageGravity.Top, 100)
        const fileUrl = storage.getFileView(bucketId, fileId)
        console.log('fileUrl', fileUrl);
        
        return {
            fileId,
            fileUrl
        }
        
    } catch (error) {
        console.log("uploadFile error", error);
        console.log(error)
        throw error
    }
}

export const getFileByFileId = (fileId: string) => { 
    try {
        const fileUrl = storage.getFileView(bucketId, fileId)
        return fileUrl
    } catch (error) {
        console.log('getFileByFileId error', error)
        console.log(error)
        throw error
    }
}

// 登录部分API

const createUser = async (email: string, name: string, user_id: string, imageuri: string) => {
    try {
        const user = await database.createDocument(databaseId, collectionIdUser, ID.unique(), {
            email,
            name,
            user_id, 
            avatar_url: imageuri
        })
        return user.$id
    } catch (error) {
        console.log('createUser error', error);
        console.log(error)
        throw error
    }
}

export const getUserByUserId = async (user_id: string) => {
    try {
        const user = await database.listDocuments(databaseId, collectionIdUser, [Query.equal('user_id', user_id)])
        return user.documents[0]
    } catch (error) {
        console.log('getUserByUserId error', error)
        throw error
    }
}

export const login = async (email: string, password: string) => {
    try {
        await account.deleteSessions().catch(() => { }); // 删除当前身份
        const res = await account.createEmailPasswordSession(email, password)
        return res
    } catch (error) {
        console.log('login error', error)
        console.log(error)
        throw error
    }
}

export const logout = async () => {
    try {
        await account.deleteSession('current')
    } catch (error) {
        console.log('logout error', error)
        console.log(error)
        throw error
    }
}

export const register = async (email: string, password: string, name: string, imageuri: string) => {
    try {
        await account.deleteSessions().catch(() => { }); // 删除当前身份
        // 1. 注册
        const user = await account.create(ID.unique(), email, password, name)
        // const avatarUrl = avatars.getInitials(name)
        const res = await createUser(email, name, user.$id, imageuri)
        // 2. 登录
        await login(email, password)
        return user.$id
    } catch (error) {
        console.log('register error', error)
        console.log(error)
        throw error
    }
}

export const getCurrentUser = async () => {
    const res = await account.get()
    if (res.$id) {
        const user = await getUserByUserId(res.$id)
        return {
            userId: res.$id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatar_url
        } as User
    }

    return null
}
  

// 1. post
export const createPost = async (title: string, content: string, image_first_url: string,images_url: string[], creator_id: string, creator_name: string, creator_avatar_url: string) => {
    try {
        const post = await database.createDocument(databaseId, collectionIdPost, ID.unique(), {
            title,
            content,
            image_first_url,
            images_url,
            creator_id,
            creator_name,
            creator_avatar_url
        })
        return post.$id
    } catch (error) {
        console.log('createPost error', error)
        console.log(error)
        throw error
    }
}

export const getPostById = async (post_id: string) => {
    try {
        const res = await database.getDocument(databaseId, collectionIdPost, post_id)
        return res
    } catch (error) {
        console.log('getPostById error', error)
        console.log(error)
        throw error
    }
}

export const getPosts = async (pageNumber: number, pageSize: number, userIds?: string[]) => {
    try {
        let queries = [Query.limit(pageSize), Query.offset(pageNumber * pageSize), Query.orderDesc('$createdAt')]
        if (userIds) {
            queries.push(Query.equal('creator_id', userIds))
        }
        const posts = await database.listDocuments(databaseId, collectionIdPost, queries)
        return posts.documents
    } catch (error) {
        console.log('getPosts error', error)
        console.log(error)
        return []
    }
}

// 2. comment
export const createComment = async (post_id: string, from_user_id: string, content: string, from_user_name: string, from_user_avatar_url: string) => {
    try {
        const res = await database.createDocument(databaseId, collectionIdComment, ID.unique(), {
            post_id,
            from_user_id,
            from_user_name,
            from_user_avatar_url,
            content
        })

        return res
    } catch (error) {
        console.log('createComment error', error)
        throw error
    }
}

export const getCommentsByPostId = async (post_id: string) => {
    try {
        const res = await database.listDocuments(databaseId, collectionIdComment, [Query.equal('post_id', post_id)])
        return res.documents
    } catch (error) {
        console.log('getCommentsByPostId', error)
        throw error
    }
}

// 3. follow
export const followUser = async (from_user_id: string, to_user_id: string) => {
    try {
        const res = await database.createDocument(databaseId, collectionIdFollow, ID.unique(), {
            from_user_id,
            to_user_id
        })
        return res
    } catch (error) {
        console.log('followUser error', error)
        console.log(error)
        throw error
    }
}

export const unFollowUser = async (from_user_id: string, to_user_id: string) => {
    try {
        const res = await database.listDocuments(databaseId, collectionIdFollow,
            [Query.equal('from_user_id', from_user_id), Query.equal('to_user_id', to_user_id)])
        if (res && res.documents) {
            const deleteRes = await database.deleteDocument(databaseId, collectionIdFollow, res.documents[0].$id)
            return deleteRes
        }
        return null

    } catch (error) {
        console.log('unFollowUser error', error)
        console.log(error)
        throw error
    }
}

export const getFollowingUsers = async (user_id: string) => {
    try {
        const res = await database.listDocuments(databaseId, collectionIdFollow,
            [Query.equal('from_user_id', user_id)]
        )
        return res.documents.map((item) => item.to_user_id)
    } catch (error) {
        console.log('getFollowingUsers error', error)
        console.log(error)
        throw error
    }
}

export { account, client };

