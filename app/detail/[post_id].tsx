import { View, Text, SafeAreaView, ScrollView, Image, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useGlobalContext } from '@/context/GlobalContext'
import { createComment, followUser, getCommentsByPostId, getFollowingUsers, getPostById, getUserByUserId, unFollowUser } from '@/lib/appwrite'
const Detail = () => {

  const { post_id } = useLocalSearchParams()
  const [post, setPost] = useState<any>(null)
  const [creatorId, setCreatorId] = useState<any>(null)
  const [creatorName, setCreatorName] = useState<any>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<any>(null)
  const [isFollowed, setIsFollowed] = useState<any>(false)

  const [comment, setComment] = useState<any>('')
  const [comments, setComments] = useState<any>([])

  const { user } = useGlobalContext()

  const getData = async () => {
    try {
      const post = await getPostById(post_id as string)
      const creator = await getUserByUserId(post.creator_id)
      const followingUsers = await getFollowingUsers(user?.userId)
      const comments = await getCommentsByPostId(post_id as string)   

      const isFollowed = followingUsers.some((followingUser: any) => followingUser === creator.user_id)

      setPost(post)
      setCreatorId(creator?.user_id)
      setCreatorName(creator?.name)
      setCreatorAvatar(creator?.avatar_url)
      setIsFollowed(isFollowed)
      setComments(comments)

    } catch (error) {
      console.log('getData error', error)
    }
  }

  const handleFollow = async () => {
    try {
      if (isFollowed) {
        await unFollowUser(user?.userId, creatorId)
      } else {
        await followUser(user?.userId, creatorId)
      }
      setIsFollowed(!isFollowed)
    } catch (error) {
      console.log('handleFollow error', error)
    }
  }

  const handleComment = async () => {
    try {
      const res = await createComment(post_id as string, user?.userId, comment, user?.name, user?.avatarUrl)
      setComment('')
      getData()
    } catch (error) {
      console.log('handleComment error', error)
    }
  }

  useEffect(() => {
    getData()
  }, [])


  return (
    <SafeAreaView className='flex-1 bg-myWhite flex-col'>
      <ScrollView>
        {/* 第一行 */}
        <View className='flex-row items-center justify-between mx-6 my-4'>
          <View className='flex-row items-center gap-2'>
            <Image
              source={{ uri: creatorAvatar }}
              className='w-10 h-10 rounded-full'
            />
            <Text className='font-semibold text-lg'>{creatorName}</Text>
          </View>
          <Pressable
            onPress={handleFollow}
            className='bg-myGreen rounded-full p-2 px-4'
          >
            <Text className='text-myWhite'>
              {isFollowed ? '已关注' : '关注'}
            </Text>
          </Pressable>
        </View>

        {/* 第二行 */}
        <View className='flex-1'>
          <Image
            source={{ uri: post?.image_url }}
            className='w-full h-[500px]'
          />
          <Text className='text-lg font-semibold mt-2'>{post?.title}</Text>
          <Text className='text-sm text-gray-500'>{post?.content}</Text>
        </View>

        {/* 第三行 */}
        <View className='flex-row items-center justify-between mx-6 my-4 gap-2'>
          <Image source={{ uri: user?.avatarUrl }} className='w-10 h-10 rounded-full' />
          <TextInput
            placeholder='添加评论'
            className='flex-1 border border-gray-300 rounded-full p-2'
            value={comment}
            onChangeText={(text) => setComment(text)}
          />
          <Pressable
            onPress={handleComment}
            className='bg-myGreen rounded-full p-2 px-4'
          >
            <Text className='text-myWhite'>发送</Text>
          </Pressable>
        </View>

        {/* 第四行 */}
        <View className='px-4 pb-6'>
          <Text className='text-lg font-bold mb-4'>全部评论 ({comments.length})</Text>
          {
            comments.map((comment: any) => (
              <View
                className='mb-2 pb-2 border-b border-myGray'
                key={comment.$id}
              >
                <View className='flex-row items-center mb-2'>
                  <Image source={{ uri: comment.from_user_avatar_url }} className='w-8 h-8 rounded-full mr-2' />
                  <View>
                    <Text className='font-medium'>{comment.from_user_name}</Text>
                    <Text className='text-xs text-gray-400'>
                      {new Date(comment.$createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <Text className='ml-10 text-gray-500'>{comment.content}</Text>
                </View>
              </View>
            ))
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Detail