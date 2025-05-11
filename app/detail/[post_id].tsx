import MediaPlayerList from '@/components/MediaPlayerList'
import PopPage from '@/components/PopPage'
import { useGlobalContext } from '@/context/GlobalContext'
import { createComment, followUser, getCommentsByPostId, getFollowingUsers, getPostById, getUserByUserId, unFollowUser } from '@/lib/appwrite'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native'
import ProfilePage from '../(public)/profile/[profile_id]'
const Detail = () => {

  const { post_id } = useLocalSearchParams()
  const [post, setPost] = useState<any>(null)
  const [creatorId, setCreatorId] = useState<any>(null)
  const [creatorName, setCreatorName] = useState<any>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<any>(null)
  const [isFollowed, setIsFollowed] = useState<any>(false)
  const [isFullScreen, setIsFullScreen] = useState<any>(false)
  const [initVideoIndex, setInitVideoIndex] = useState<any>(-1)
  const [profileVisible, setProfileVisible] = useState(false)

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
      setInitVideoIndex(post?.hasVideo)

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

  useEffect(() => {
    if (initVideoIndex !== -1) {
      console.log('initVideoIndex', initVideoIndex);
      
      setIsFullScreen(true)
    }
  }, [initVideoIndex])


  return (
    <SafeAreaView className='flex-1 bg-myBG flex-col mt-8'>
      <ScrollView>
        {/* 第一行 */}
        <View className='flex-row items-center justify-between mx-6 my-4'>
          <Pressable 
            onPress={() => {setProfileVisible(true)}}
            // onPress={() => router.push({ pathname: '/(public)/profile/[profile_id]', params: { profile_id: creatorId } })}
          >
              <View className='flex-row items-center gap-2'>
                <Image
                  source={{ uri: creatorAvatar }}
                  className='w-10 h-10 rounded-full'
                />
                <Text className='font-semibold text-lg text-myPriFont'>{creatorName}</Text> 
              </View>
              <PopPage
                visible={profileVisible}
                onClose={() => setProfileVisible(false)}
                height="980"
                contentComponent={<ProfilePage profile_id={creatorId} />}
              />     
          </Pressable>
          
          <View className='flex-col items-center justify-center'>
            <Text className='text-sm text-gray-300'>{new Date(post?.$createdAt).toLocaleDateString('zh-CN')}</Text>
            <Pressable
              onPress={() => {
                setIsFullScreen(!isFullScreen)
                // 这里可以添加全屏逻辑
              }}
              className='bg-myButton rounded-full px-4'
            >
              <Text className='text-myPriFont'>{isFullScreen ? '><':'[ ]'}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleFollow}
            className={`rounded-full p-2 px-4
               ${isFollowed ? 'bg-gray-500' : 'bg-myButton'}`}
          >
            <Text className='text-myPriFont'>
              {isFollowed ? '已关注' : '关注'}
            </Text>
          </Pressable>
          {/* <ShareButton 
            content={{
              text: post?.title,
              url: `https://example.com/posts/${post_id}`,
              imageUri: post?.images_url?.[0],
              title: 'Share this post'
            }} 
          /> */}
        </View> 
        <View>
        { isFullScreen ? (
            <View className='flex-1 w-full h-full bg-black justify-center items-center mt-64'> 
                <MediaPlayerList 
                  mediaUris={[
                    // post?.image_first_url,
                    ...(post?.images_url || [])
                  ]}
                  initialIndex={initVideoIndex}
                />  
            </View>
          ):
          (
            <>
              {/* 第二行 */}
              <View className='flex-1'> 
                {post ? ( 
                  <MediaPlayerList 
                    mediaUris={[
                      // post?.image_first_url,
                      ...(post?.images_url || [])
                    ]}
                    initialIndex={0}
                  />  
                ) : (
                    <View className="w-full h-[500px] bg-gray-800" /> // 加载中的占位
                )}
                <Text className='text-lg font-semibold mt-2 text-myPriFont'>{post?.title}</Text>
                <Text className='text-sm text-gray-300'>{post?.content}</Text>
              </View>

              {/* 第三行 */}
              <View className='flex-row items-center justify-between mx-6 my-4 gap-2'>
                <Image source={{ uri: user?.avatarUrl }} className='w-10 h-10 rounded-full' />
                <TextInput
                  placeholder='添加评论'
                  placeholderTextColor={'#DFF0FD'}
                  className='flex-1 border border-myButton rounded-full p-2 text-myPriFont'
                  value={comment}
                  onChangeText={(text) => setComment(text)}
                />
                <Pressable
                  onPress={handleComment}
                  className='bg-myButton rounded-full p-2 px-4'
                >
                  <Text className='text-myPriFont'>发送</Text>
                </Pressable>
              </View>

              {/* 第四行 */}
              <View className='px-4 pb-6'>
                <Text className='text-lg font-bold mb-4 text-myPriFont'>全部评论 ({comments.length})</Text>
                {
                  comments.map((comment: any) => (
                    <View
                      className='mb-2 pb-2 border-b border-myGray'
                      key={comment.$id}
                    >
                      <View className='flex-row items-center mb-2'>
                        <Image source={{ uri: comment.from_user_avatar_url }} className='w-8 h-8 rounded-full mr-2' />
                        <View>
                          <Text className='font-medium text-myPriFont'>{comment.from_user_name}</Text>
                          <Text className='text-xs text-gray-300'>
                            {new Date(comment.$createdAt).toLocaleDateString('zh-CN')}
                          </Text>
                        </View>
                        <Text className='ml-10 text-gray-500'>{comment.content}</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            </>
          )
        }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Detail
 