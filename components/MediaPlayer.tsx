import { getFileInfo } from '@/lib/appwrite';
import { createVideoPlayer, VideoSource, VideoView } from 'expo-video';
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export type MediaPlayerHandle = {
  play: () => void;
  pause: () => void;
};

type MediaPlayerProps = {
  uri: string;
  autoPlay?: boolean;
  onReady?: () => void;
  onPlaybackStatusUpdate?: (status: { 
    isPlaying: boolean; 
    positionMillis: number; 
    durationMillis: number 
  }) => void;
};

const MediaPlayerComponent: ForwardRefRenderFunction<MediaPlayerHandle, MediaPlayerProps> = (
  { uri, autoPlay = false, onReady, onPlaybackStatusUpdate },
  ref
) => {
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'unknown'>('unknown');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const videoPlayer = useRef<ReturnType<typeof createVideoPlayer> | null>(null);

  const extractFileId = (uri: string): string | null => {
    try {
      const url = new URL(uri);
      const pathParts = url.pathname.split('/');
      const filesIndex = pathParts.indexOf('files');
      return filesIndex !== -1 ? pathParts[filesIndex + 1] : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const fileId = extractFileId(uri);
        if (!fileId) throw new Error('Invalid URI format');

        const { mimeType, fileUrl } = await getFileInfo(fileId);
        const type = mimeType.startsWith('video/') ? 'video' : 
                    mimeType.startsWith('image/') ? 'image' : 'unknown';
        
        if (type === 'unknown') throw new Error('Unsupported media type');

        setMediaType(type);
        setMediaUrl(fileUrl);

        if (type === 'video') {
          const source: VideoSource = {
            uri: fileUrl,
            headers: { 'Cache-Control': 'max-age=3600' },
            useCaching: true
          };

          // 正确创建视频播放器实例
          videoPlayer.current = createVideoPlayer(source);
          
          videoPlayer.current.addListener('playingChange', (event) => {
            setIsPlaying(event.isPlaying);
          });

          videoPlayer.current.addListener('statusChange', (event) => {
            if (event.status === 'readyToPlay') {
              setDuration(videoPlayer.current!.duration * 1000);
              setIsLoading(false);
              onReady?.();
              if (autoPlay) videoPlayer.current!.play();
            }
            if (event.status === 'error') {
              setHasError(true);
              setIsLoading(false);
            }
          });

          videoPlayer.current.addListener('timeUpdate', (event) => {
            const currentTime = event.currentTime * 1000; // Assuming `currentTime` is the correct property
            const durationMillis = videoPlayer.current?.duration ? videoPlayer.current.duration * 1000 : 0;
            setPosition(currentTime);
            onPlaybackStatusUpdate?.({
              isPlaying: videoPlayer.current!.playing,
              positionMillis: currentTime,
              durationMillis: durationMillis,
            });
          });

        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Media initialization error:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    initializeMedia();

    return () => {
      videoPlayer.current?.pause();
      videoPlayer.current?.removeAllListeners('playingChange');
      videoPlayer.current?.removeAllListeners('statusChange');
      videoPlayer.current?.removeAllListeners('timeUpdate');
      videoPlayer.current = null;
    };
  }, [uri]);

  useImperativeHandle(ref, () => ({
    play: () => videoPlayer.current?.play(),
    pause: () => videoPlayer.current?.pause()
  }));

  const handlePlayPause = () => {
    isPlaying ? videoPlayer.current?.pause() : videoPlayer.current?.play();
  };

  const handleSeek = (value: number) => {
    const newPosition = value * duration;
    videoPlayer.current!.currentTime = newPosition / 1000;
    setPosition(newPosition);
  };

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>无法加载媒体资源</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mediaType === 'video' ? (
        <>
          <VideoView
            player={videoPlayer.current!}
            style={styles.media}
            allowsFullscreen
            allowsPictureInPicture
          />
          {/* <View style={styles.controls}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={duration > 0 ? position / duration : 0}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255,255,255,0.5)"
              thumbTintColor="#FFFFFF"
            />
          </View> */}
        </>
      ) : (
        <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="contain" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    // transform: [{ rotate: '90deg' }], 
  },
  media: {
    width: '100%',
    // transform: [{ rotate: '-90deg' }],
    height: '100%'
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center'
  },
  playButton: {
    alignSelf: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    paddingHorizontal: 20
  },
  slider: {
    width: '100%',
    height: 40
  },
  errorText: {
    color: 'white',
    fontSize: 16
  }
});

const MediaPlayer = forwardRef(MediaPlayerComponent);
export default MediaPlayer;